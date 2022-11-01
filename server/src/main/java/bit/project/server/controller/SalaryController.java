package bit.project.server.controller;

import bit.project.server.UsecaseList;
import bit.project.server.dao.*;
import bit.project.server.entity.*;
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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin
@RestController
@RequestMapping("/salaries")
public class SalaryController {

    @Autowired
    private SalaryDao salaryDao;

    @Autowired
    private EmployeeDao employeeDao;

    @Autowired
    private FileDao fileDao;

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

    public SalaryController(){
        codeConfig = new CodeGenerator.CodeGeneratorConfig("salary");
        codeConfig.setColumnName("code");
        codeConfig.setLength(10);
        codeConfig.setPrefix("SA");
        codeConfig.setYearlyRenew(true);
    }

    @GetMapping
    public Page<Salary> getAll(PageQuery pageQuery, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get all salaries", UsecaseList.SHOW_ALL_SALARIES);

        if(pageQuery.isEmptySearch()){
            return salaryDao.findAll(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
        }

        String code = pageQuery.getSearchParam("code");
        String date = pageQuery.getSearchParam("date");
        Integer employeeId = pageQuery.getSearchParamAsInteger("employee");

        List<Salary> salaries = salaryDao.findAll(DEFAULT_SORT);
        Stream<Salary> stream = salaries.parallelStream();

        List<Salary> filteredSalaries = stream.filter(salary -> {
            if(code!=null)
                if(!salary.getCode().toLowerCase().contains(code.toLowerCase())) return false;
            if(date!=null)
                if(!salary.getDate().toString().toLowerCase().contains(date.toLowerCase())) return false;
            if(employeeId!=null)
                if(!salary.getEmployee().getId().equals(employeeId)) return false;
            return true;
        }).collect(Collectors.toList());

        return PageHelper.getAsPage(filteredSalaries, pageQuery.getPage(), pageQuery.getSize());

    }

    @GetMapping("/basic")
    public Page<Salary> getAllBasic(PageQuery pageQuery, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get all salaries' basic data", UsecaseList.SHOW_ALL_SALARIES);
        return salaryDao.findAllBasic(PageRequest.of(pageQuery.getPage(), pageQuery.getSize(), DEFAULT_SORT));
    }

    @GetMapping("/{id}")
    public Salary get(@PathVariable Integer id, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to get salary", UsecaseList.SHOW_SALARY_DETAILS, UsecaseList.UPDATE_SALARY);
        Optional<Salary> optionalSalary = salaryDao.findById(id);
        if(optionalSalary.isEmpty()) throw new ObjectNotFoundException("Salary not found");
        return optionalSalary.get();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to delete salaries", UsecaseList.DELETE_SALARY);

        try{
            if(salaryDao.existsById(id)) salaryDao.deleteById(id);
        }catch (DataIntegrityViolationException | RollbackException e){
            throw new ConflictException("Cannot delete. Because this salary already used in another module");
        }
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceLink add(@RequestBody Salary salary, HttpServletRequest request) throws InterruptedException {
        User authUser = accessControlManager.authorize(request, "No privilege to add new salary", UsecaseList.ADD_SALARY);

        salary.setTocreation(LocalDateTime.now());
        salary.setCreator(authUser);
        salary.setId(null);

        EntityValidator.validate(salary);

        ValidationErrorBag errorBag = new ValidationErrorBag();

        if(errorBag.count()>0) throw new DataValidationException(errorBag);

        PersistHelper.save(()->{
            salary.setCode(codeGenerator.getNextId(codeConfig));
            return salaryDao.save(salary);
        });

        return new ResourceLink(salary.getId(), "/salaries/"+salary.getId());
    }

    @PutMapping("/{id}")
    public ResourceLink update(@PathVariable Integer id, @RequestBody Salary salary, HttpServletRequest request) {
        accessControlManager.authorize(request, "No privilege to update salary details", UsecaseList.UPDATE_SALARY);

        Optional<Salary> optionalSalary = salaryDao.findById(id);
        if(optionalSalary.isEmpty()) throw new ObjectNotFoundException("Salary not found");
        Salary oldSalary = optionalSalary.get();

        salary.setId(id);
        salary.setCode(oldSalary.getCode());
        salary.setCreator(oldSalary.getCreator());
        salary.setTocreation(oldSalary.getTocreation());

        salary = salaryDao.save(salary);
        return new ResourceLink(salary.getId(), "/salaries/"+salary.getId());
    }
}