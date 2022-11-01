package bit.project.server.controller;

import bit.project.server.UsecaseList;
import bit.project.server.dao.CustomerDao;
import bit.project.server.entity.Customer;
import bit.project.server.entity.Employee;
import bit.project.server.entity.User;
import bit.project.server.util.dto.PageQuery;
import bit.project.server.util.dto.ResourceLink;
import bit.project.server.util.exception.ConflictException;
import bit.project.server.util.exception.DataValidationException;
import bit.project.server.util.exception.ObjectNotFoundException;
import bit.project.server.util.helper.CodeGenerator;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin
@RestController
@RequestMapping("/customers")
public class CustomerController {

    @Autowired
    private CustomerDao customerDao;

    @Autowired
    private AccessControlManager accessControlManager;

    @Autowired
    private CodeGenerator codeGenerator;

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "tocreation");
    private final CodeGenerator.CodeGeneratorConfig codeConfig;

    public CustomerController(){
        codeConfig = new CodeGenerator.CodeGeneratorConfig("customer");
        codeConfig.setColumnName("code");
        codeConfig.setLength(10);
        codeConfig.setPrefix("CU");
        codeConfig.setYearlyRenew(true);
    }

    @GetMapping
    public Page<Customer> getAll(PageQuery pageQuery, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get all customers", UsecaseList.SHOW_ALL_CUSTOMERS);

        if(pageQuery.isEmptySearch()){
            return customerDao.findAll(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
        }

        String code = pageQuery.getSearchParam("code");
        String name = pageQuery.getSearchParam("name");
        String contact1 = pageQuery.getSearchParam("contact1");
        String email = pageQuery.getSearchParam("email");

        List<Customer> customers = customerDao.findAll(DEFAULT_SORT);
        Stream<Customer> stream = customers.parallelStream();

        List<Customer> filteredCustomers = stream.filter(customer -> {
            if(code!=null)
                if(!customer.getCode().toLowerCase().contains(code.toLowerCase())) return false;
            if(name!=null)
                if(!customer.getName().toLowerCase().contains(name.toLowerCase())) return false;
            if(contact1!=null)
                if(!customer.getContact1().toLowerCase().contains(contact1.toLowerCase())) return false;
            if(email!=null)
                if(!customer.getEmail().toLowerCase().contains(email.toLowerCase())) return false;
            return true;
        }).collect(Collectors.toList());

        return PageHelper.getAsPage(filteredCustomers, pageQuery.getPage(), pageQuery.getSize());

    }

    @GetMapping("/basic")
    public Page<Customer> getAllBasic(PageQuery pageQuery, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get all customers' basic data", UsecaseList.SHOW_ALL_CUSTOMERS);
        return customerDao.findAllBasic(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
    }

    @GetMapping("/{id}")
    public Customer get(@PathVariable Integer id, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get customer", UsecaseList.SHOW_CUSTOMER_DETAILS, UsecaseList.UPDATE_CUSTOMER);
        Optional<Customer> optionalCustomer = customerDao.findById(id);
        if(optionalCustomer.isEmpty()) throw new ObjectNotFoundException("Customer not found");
        return optionalCustomer.get();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to delete customers", UsecaseList.DELETE_CUSTOMER);

        try{
            if(customerDao.existsById(id)) customerDao.deleteById(id);
        }catch (DataIntegrityViolationException | RollbackException e){
            throw new ConflictException("Cannot delete. Because this customer already used in another module");
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceLink add(@RequestBody Customer customer, HttpServletRequest request) throws InterruptedException {
        User authUser = accessControlManager.authorize(request, "No privilege to add new customer", UsecaseList.ADD_CUSTOMER);

        customer.setTocreation(LocalDateTime.now());
        customer.setCreator(authUser);
        customer.setId(null);


        EntityValidator.validate(customer);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(customer.getEmail() != null){
            Customer customerByEmail = customerDao.findByEmail(customer.getEmail());
            if(customerByEmail!=null) errorBag.add("email","email already exists");
        }

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        PersistHelper.save(()->{
            customer.setCode(codeGenerator.getNextId(codeConfig));
            return customerDao.save(customer);
        });

        return new ResourceLink(customer.getId(), "/customers/"+customer.getId());
    }

    @PutMapping("/{id}")
    public ResourceLink update(@PathVariable Integer id, @RequestBody Customer customer, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to update customer details", UsecaseList.UPDATE_CUSTOMER);

        Optional<Customer> optionalCustomer = customerDao.findById(id);
        if(optionalCustomer.isEmpty()) throw new ObjectNotFoundException("Customer not found");
        Customer oldCustomer = optionalCustomer.get();

        customer.setId(id);
        customer.setCode(oldCustomer.getCode());
        customer.setCreator(oldCustomer.getCreator());
        customer.setTocreation(oldCustomer.getTocreation());


        EntityValidator.validate(customer);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(customer.getEmail() != null){
            Customer customerByEmail = customerDao.findByEmail(customer.getEmail());
            if(customerByEmail!=null)
                if(!customerByEmail.getId().equals(id))
                    errorBag.add("email","email already exists");
        }

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        customer = customerDao.save(customer);
        return new ResourceLink(customer.getId(), "/customers/"+customer.getId());
    }

}