package bit.project.server.controller;

import bit.project.server.UsecaseList;
import bit.project.server.dao.FileDao;
import bit.project.server.dao.ItemDao;
import bit.project.server.entity.File;
import bit.project.server.entity.Item;
import bit.project.server.entity.Itemstatus;
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
import javax.persistence.Tuple;
import javax.servlet.http.HttpServletRequest;
import java.io.InterruptedIOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin
@RestController
@RequestMapping("/items")
public class ItemController {

    @Autowired
    private ItemDao itemDao;

    @Autowired
    private AccessControlManager accessControlManager;

    @Autowired
    private CodeGenerator codeGenerator;

    @Autowired private FileDao fileDao;

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "tocreation");
    private final CodeGenerator.CodeGeneratorConfig codeConfig;

    public ItemController(){
        codeConfig = new CodeGenerator.CodeGeneratorConfig("item");
        codeConfig.setColumnName("code");
        codeConfig.setLength(10);
        codeConfig.setPrefix("IT");
        codeConfig.setYearlyRenew(true);
    }

    @GetMapping
    public Page<Item> getAll(PageQuery pageQuery, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get all items", UsecaseList.SHOW_ALL_ITEMS);

        if(pageQuery.isEmptySearch()){
            return itemDao.findAll(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
        }

        String code = pageQuery.getSearchParam("code");
        String name = pageQuery.getSearchParam("name");
        Integer categoryId = pageQuery.getSearchParamAsInteger("category");
        Integer itemstatusId = pageQuery.getSearchParamAsInteger("itemstatus");

        List<Item> items = itemDao.findAll(DEFAULT_SORT);
        Stream<Item> stream = items.parallelStream();

        List<Item> filteredItems = stream.filter(item -> {
            if(code!=null)
                if(!item.getCode().toLowerCase().contains(code.toLowerCase())) return false;
            if(name!=null)
                if(!item.getName().toLowerCase().contains(name.toLowerCase())) return false;
            if(categoryId!=null)
                if(!item.getCategory().getId().equals(categoryId)) return false;
            if(itemstatusId!=null)
                if(!item.getItemstatus().getId().equals(itemstatusId)) return false;
            return true;
        }).collect(Collectors.toList());

        return PageHelper.getAsPage(filteredItems, pageQuery.getPage(), pageQuery.getSize());

    }

    @GetMapping("/basic")
    public Page<Item> getAllBasic(PageQuery pageQuery, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get all items' basic data", UsecaseList.SHOW_ALL_ITEMS);
        return itemDao.findAllBasic(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
    }

    @GetMapping("/basic/{supplierId}")
    public List<Item> getAllBasicBySupplier(HttpServletRequest request, @PathVariable Integer supplierId){
        accessControlManager.authorize(request, "No privilege to get all items' basic data", UsecaseList.SHOW_ALL_ITEMS);
        List<Tuple> tuples = itemDao.findAllBasicBySupplier(supplierId);
        List<Item> items = new ArrayList<>();

        for (Tuple tuple: tuples){
            Item i = itemDao.findById((Integer) tuple.get(0)).get();
            items.add(new Item(i.getId(), i.getCode(), i.getName(), i.getPrice(), i.getQty()));
        }
        return items;
    }

    @GetMapping("/{id}")
    public Item get(@PathVariable Integer id, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get item", UsecaseList.SHOW_ITEM_DETAILS, UsecaseList.UPDATE_ITEM);
        Optional<Item> optionalItem = itemDao.findById(id);
        if(optionalItem.isEmpty()) throw new ObjectNotFoundException("Item not found");
        return optionalItem.get();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to delete items", UsecaseList.DELETE_ITEM);

        try{
            if(itemDao.existsById(id)) itemDao.deleteById(id);
        }catch (DataIntegrityViolationException | RollbackException e){
            throw new ConflictException("Cannot delete. Because this item already used in another module");
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceLink add(@RequestBody Item item, HttpServletRequest request) throws InterruptedException {
        User authUser = accessControlManager.authorize(request, "No privilege to add new item", UsecaseList.ADD_ITEM);

        item.setTocreation(LocalDateTime.now());
        item.setCreator(authUser);
        item.setId(null);
        item.setItemstatus(new Itemstatus(1));

        EntityValidator.validate(item);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(item.getName() != null){
            Item itemByName = itemDao.findByName(item.getName());
            if(itemByName!=null) errorBag.add("name","name already exists");
        }

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        PersistHelper.save(()->{
            item.setCode(codeGenerator.getNextId(codeConfig));
            return itemDao.save(item);
        });

        return new ResourceLink(item.getId(), "/items/"+item.getId());
    }

    @PutMapping("/{id}")
    public ResourceLink update(@PathVariable Integer id, @RequestBody Item item, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to update item details", UsecaseList.UPDATE_ITEM);

        Optional<Item> optionalItem = itemDao.findById(id);
        if(optionalItem.isEmpty()) throw new ObjectNotFoundException("Item not found");
        Item oldItem = optionalItem.get();

        item.setId(id);
        item.setCode(oldItem.getCode());
        item.setCreator(oldItem.getCreator());
        item.setTocreation(oldItem.getTocreation());


        EntityValidator.validate(item);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(item.getName() != null){
            Item itemByName = itemDao.findByName(item.getName());
            if(itemByName!=null)
                if(!itemByName.getId().equals(id))
                    errorBag.add("name","name already exists");
        }

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        item = itemDao.save(item);
        return new ResourceLink(item.getId(), "/items/"+item.getId());
    }

    @GetMapping("/{id}/photo")
    public HashMap<String, String> getPhoto(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get item photo", UsecaseList.SHOW_ITEM_DETAILS);

        Item item = getItem(id);

        Optional<File> optionalFile = fileDao.findFileById(item.getPhoto());

        if(optionalFile.isEmpty()) {
            throw new ObjectNotFoundException("Photo not found");
        }

        File photo = optionalFile.get();
        HashMap<String, String> data = new HashMap<>();

        data.put("file", FileHelper.byteArrayToBase64(photo.getFile(), photo.getFilemimetype()));

        return data;
    }
    private Item getItem(Integer id){
        Optional<Item> itemOptional = itemDao.findById(id);
        if(itemOptional.isEmpty()) throw new ObjectNotFoundException("Item not found");
        return itemOptional.get();
    }
}