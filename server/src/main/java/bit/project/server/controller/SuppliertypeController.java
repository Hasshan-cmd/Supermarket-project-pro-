package bit.project.server.controller;

import java.util.List;
import bit.project.server.entity.Suppliertype;
import bit.project.server.dao.SuppliertypeDao;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@CrossOrigin
@RestController
@RequestMapping("/suppliertypes")
public class SuppliertypeController{

    @Autowired
    private SuppliertypeDao suppliertypeDao;

    @GetMapping
    public List<Suppliertype> getAll(){
        return suppliertypeDao.findAll();
    }
}