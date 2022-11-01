package bit.project.server.controller;

import bit.project.server.UsecaseList;
import bit.project.server.dao.DesignationDao;
import bit.project.server.dao.NotificationDao;
import bit.project.server.dao.PurchaseDao;
import bit.project.server.entity.*;
import bit.project.server.util.dto.PageQuery;
import bit.project.server.util.dto.ResourceLink;
import bit.project.server.util.exception.ConflictException;
import bit.project.server.util.exception.ObjectNotFoundException;
import bit.project.server.util.helper.CodeGenerator;
import bit.project.server.util.helper.PageHelper;
import bit.project.server.util.helper.PersistHelper;
import bit.project.server.util.security.AccessControlManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.persistence.RollbackException;
import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin
@RestController
@RequestMapping("/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseDao purchaseDao;

    @Autowired
    private DesignationDao designationDao;

    @Autowired
    private AccessControlManager accessControlManager;

    @Autowired
    private CodeGenerator codeGenerator;

    @Autowired
    private NotificationDao notificationDao;

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "tocreation");
    private final CodeGenerator.CodeGeneratorConfig codeConfig;

    public PurchaseController(){
        codeConfig = new CodeGenerator.CodeGeneratorConfig("purchase");
        codeConfig.setColumnName("code");
        codeConfig.setLength(10);
        codeConfig.setPrefix("PU");
        codeConfig.setYearlyRenew(true);
    }

    @GetMapping
    public Page<Purchase> getAll(PageQuery pageQuery, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get all purchases", UsecaseList.SHOW_ALL_PURCHASES);

        if(pageQuery.isEmptySearch()){
            return purchaseDao.findAll(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
        }

        String code = pageQuery.getSearchParam("code");
        String date = pageQuery.getSearchParam("date");
        Integer supplierId = pageQuery.getSearchParamAsInteger("supplier");

        List<Purchase> purchases = purchaseDao.findAll(DEFAULT_SORT);
        Stream<Purchase> stream = purchases.parallelStream();

        List<Purchase> filteredPurchases = stream.filter(purchase -> {
            if(code!=null)
                if(!purchase.getCode().toLowerCase().contains(code.toLowerCase())) return false;
            if(date!=null)
                if(!purchase.getDate().toString().toLowerCase().contains(date.toLowerCase())) return false;
            if(supplierId!=null)
                if(!purchase.getSupplier().getId().equals(supplierId)) return false;
            return true;
        }).collect(Collectors.toList());

        return PageHelper.getAsPage(filteredPurchases, pageQuery.getPage(), pageQuery.getSize());

    }

    @GetMapping("/basic")
    public Page<Purchase> getAllBasic(PageQuery pageQuery, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get all purchases' basic data", UsecaseList.SHOW_ALL_PURCHASES);
        return purchaseDao.findAllBasic(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
    }

    @GetMapping("/{id}")
    public Purchase get(@PathVariable Integer id, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get purchase", UsecaseList.SHOW_PURCHASE_DETAILS, UsecaseList.UPDATE_PURCHASE);
        Optional<Purchase> optionalPurchase = purchaseDao.findById(id);
        if(optionalPurchase.isEmpty()) throw new ObjectNotFoundException("Purchase not found");
        return optionalPurchase.get();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to delete purchases", UsecaseList.DELETE_PURCHASE);

        try{
            if(purchaseDao.existsById(id)) purchaseDao.deleteById(id);
        }catch (DataIntegrityViolationException | RollbackException e){
            throw new ConflictException("Cannot delete. Because this purchase already used in another module");
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceLink add(@RequestBody Purchase purchase, HttpServletRequest request) throws InterruptedException {
        User authUser = accessControlManager.authorize(request, "No privilege to add new purchase", UsecaseList.ADD_PURCHASE);

        purchase.setTocreation(LocalDateTime.now());
        purchase.setCreator(authUser);
        purchase.setId(null);

        BigDecimal total = new BigDecimal(0);

        for (Purchaseitem purchaseitem : purchase.getPurchaseitemList()) {
            purchaseitem.setPurchase(purchase);

            BigDecimal qty = new BigDecimal(purchaseitem.getQty());
            BigDecimal unitprice = purchaseitem.getUnitprice();
            BigDecimal lineTotal = unitprice.multiply(qty);
            total = total.add(lineTotal);
        }

        purchase.setTotal(total);

        PersistHelper.save(()->{
            purchase.setCode(codeGenerator.getNextId(codeConfig));
            return purchaseDao.save(purchase);
        });

        Designation manager = designationDao.findById(1).get();
        List<Employee> employees = manager.getDesignationEmployeeList();
        for (Employee emp: employees) {
            List<User> uList = emp.getAccoutList();
            if (uList.isEmpty()) continue;
            User user =uList.get(0);

            Notification notification = new Notification();
            notification.setId(UUID.randomUUID().toString());
            notification.setUser(user);
            notification.setDosend(LocalDateTime.now());
            notification.setMessage("Hello" + emp.getCallingname() + ", Add new purchase...");

            notificationDao.save(notification);
        }

        return new ResourceLink(purchase.getId(), "/purchases/"+purchase.getId());
    }

    @PutMapping("/{id}")
    public ResourceLink update(@PathVariable Integer id, @RequestBody Purchase purchase, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to update purchase details", UsecaseList.UPDATE_PURCHASE);

        Optional<Purchase> optionalPurchase = purchaseDao.findById(id);
        if(optionalPurchase.isEmpty()) throw new ObjectNotFoundException("Purchase not found");
        Purchase oldPurchase = optionalPurchase.get();

        purchase.setId(id);
        purchase.setCode(oldPurchase.getCode());
        purchase.setCreator(oldPurchase.getCreator());
        purchase.setTocreation(oldPurchase.getTocreation());

        BigDecimal total = new BigDecimal(0);

        for (Purchaseitem purchaseitem : purchase.getPurchaseitemList()) {
            purchaseitem.setPurchase(purchase);

            BigDecimal qty = new BigDecimal(purchaseitem.getQty());
            BigDecimal unitprice = purchaseitem.getUnitprice();
            BigDecimal lineTotal = unitprice.multiply(qty);
            total = total.add(lineTotal);
        }

        purchase.setTotal(total);

        purchase = purchaseDao.save(purchase);
        return new ResourceLink(purchase.getId(), "/purchases/"+purchase.getId());
    }

}