package bit.project.server.controller;
import bit.project.server.UsecaseList;
import bit.project.server.dao.FileDao;
import bit.project.server.dao.SupplierDao;
import bit.project.server.entity.File;
import bit.project.server.entity.Supplierstatus;
import bit.project.server.entity.Supplier;
import bit.project.server.entity.User;
import bit.project.server.util.dto.PageQuery;
import bit.project.server.util.dto.ResourceLink;
import bit.project.server.util.exception.ConflictException;
import bit.project.server.util.exception.DataValidationException;
import bit.project.server.util.exception.ObjectNotFoundException;
import bit.project.server.util.helper.CodeGenerator;
import bit.project.server.util.helper.FileHelper;
import bit.project.server.util.helper.PageHelper;
import bit.project.server.util.helper.PersistHelper;
import bit.project.server.util.security.AccessControlManager;
import bit.project.server.util.validation.EntityValidator;
import bit.project.server.util.validation.ValidationErrorBag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import javax.persistence.RollbackException;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin
@RestController
@RequestMapping("/suppliers")
public class SupplierController {

    @Autowired
    private SupplierDao supplierDao;

    @Autowired
    private AccessControlManager accessControlManager;

    @Autowired
    private CodeGenerator codeGenerator;

    @Autowired private FileDao fileDao;

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "tocreation");
    private final CodeGenerator.CodeGeneratorConfig codeConfig;

    public SupplierController(){
        codeConfig = new CodeGenerator.CodeGeneratorConfig("supplier");
        codeConfig.setColumnName("code");
        codeConfig.setLength(10);
        codeConfig.setPrefix("SU");
        codeConfig.setYearlyRenew(true);
    }

    @GetMapping
    public Page<Supplier> getAll(PageQuery pageQuery, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get all suppliers", UsecaseList.SHOW_ALL_SUPPLIERS);

        if(pageQuery.isEmptySearch()){
            return supplierDao.findAll(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
        }

        String code = pageQuery.getSearchParam("code");
        String name = pageQuery.getSearchParam("name");
        Integer suppliertypeId = pageQuery.getSearchParamAsInteger("suppliertype");
        Integer supplierstatusId = pageQuery.getSearchParamAsInteger("supplierstatus");

        List<Supplier> suppliers = supplierDao.findAll(DEFAULT_SORT);
        Stream<Supplier> stream = suppliers.parallelStream();

        List<Supplier> filteredSuppliers = stream.filter(supplier -> {
            if(code!=null)
                if(!supplier.getCode().toLowerCase().contains(code.toLowerCase())) return false;
            if(name!=null)
                if(!supplier.getName().toLowerCase().contains(name.toLowerCase())) return false;
            if(suppliertypeId!=null)
                if(!supplier.getSuppliertype().getId().equals(suppliertypeId)) return false;
            if(supplierstatusId!=null)
                if(!supplier.getSupplierstatus().getId().equals(supplierstatusId)) return false;
            return true;
        }).collect(Collectors.toList());

        return PageHelper.getAsPage(filteredSuppliers, pageQuery.getPage(), pageQuery.getSize());

    }

    @GetMapping("/basic")
    public Page<Supplier> getAllBasic(PageQuery pageQuery, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get all suppliers' basic data", UsecaseList.SHOW_ALL_SUPPLIERS);
        return supplierDao.findAllBasic(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
    }

    @GetMapping("/{id}")
    public Supplier get(@PathVariable Integer id, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get supplier", UsecaseList.SHOW_SUPPLIER_DETAILS, UsecaseList.UPDATE_SUPPLIER);
        Optional<Supplier> optionalSupplier = supplierDao.findById(id);
        if(optionalSupplier.isEmpty()) throw new ObjectNotFoundException("Supplier not found");
        return optionalSupplier.get();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to delete suppliers", UsecaseList.DELETE_SUPPLIER);

        try{
            if(supplierDao.existsById(id)) supplierDao.deleteById(id);
        }catch (DataIntegrityViolationException | RollbackException e){
            throw new ConflictException("Cannot delete. Because this supplier already used in another module");
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceLink add(@RequestBody Supplier supplier, HttpServletRequest request) throws InterruptedException {
        User authUser = accessControlManager.authorize(request, "No privilege to add new supplier", UsecaseList.ADD_SUPPLIER);

        supplier.setTocreation(LocalDateTime.now());
        supplier.setCreator(authUser);
        supplier.setId(null);
        supplier.setSupplierstatus(new Supplierstatus(1));;

        EntityValidator.validate(supplier);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(supplier.getEmail() != null){
            Supplier supplierByEmail = supplierDao.findByEmail(supplier.getEmail());
            if(supplierByEmail!=null) errorBag.add("email","email already exists");
        }

        if(supplier.getName() != null){
            Supplier supplierByName = supplierDao.findByName(supplier.getName());
            if(supplierByName!=null) errorBag.add("name","name already exists");
        }

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        PersistHelper.save(()->{
            supplier.setCode(codeGenerator.getNextId(codeConfig));
            return supplierDao.save(supplier);
        });

        return new ResourceLink(supplier.getId(), "/suppliers/"+supplier.getId());
    }

    @PutMapping("/{id}")
    public ResourceLink update(@PathVariable Integer id, @RequestBody Supplier supplier, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to update supplier details", UsecaseList.UPDATE_SUPPLIER);

        Optional<Supplier> optionalSupplier = supplierDao.findById(id);
        if(optionalSupplier.isEmpty()) throw new ObjectNotFoundException("Supplier not found");
        Supplier oldSupplier = optionalSupplier.get();

        supplier.setId(id);
        supplier.setCode(oldSupplier.getCode());
        supplier.setCreator(oldSupplier.getCreator());
        supplier.setTocreation(oldSupplier.getTocreation());


        EntityValidator.validate(supplier);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(supplier.getEmail() != null){
            Supplier supplierByEmail = supplierDao.findByEmail(supplier.getEmail());
            if(supplierByEmail!=null)
                if(!supplierByEmail.getId().equals(id))
                    errorBag.add("email","email already exists");
        }

        if(supplier.getName() != null){
            Supplier supplierByName = supplierDao.findByName(supplier.getName());
            if(supplierByName!=null)
                if(!supplierByName.getId().equals(id))
                    errorBag.add("name","name already exists");
        }

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        supplier = supplierDao.save(supplier);
        return new ResourceLink(supplier.getId(), "/suppliers/"+supplier.getId());
    }

    @GetMapping("/{id}/logo")
    public HashMap<String, String> getLogo(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get supplier logo", UsecaseList.SHOW_SUPPLIER_DETAILS);

        Supplier supplier = getSupplier(id);

        Optional<File> optionalFile = fileDao.findFileById(supplier.getLogo());

        if(optionalFile.isEmpty()) {
            throw new ObjectNotFoundException("Logo not found");
        }

        File logo = optionalFile.get();
        HashMap<String, String> data = new HashMap<>();

        data.put("file", FileHelper.byteArrayToBase64(logo.getFile(), logo.getFilemimetype()));

        return data;
    }
    private Supplier getSupplier(Integer id){
        Optional<Supplier> supplierOptional = supplierDao.findById(id);
        if(supplierOptional.isEmpty()) throw new ObjectNotFoundException("Supplier not found");
        return supplierOptional.get();
    }
}