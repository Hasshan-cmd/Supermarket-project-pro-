package bit.project.server.controller;

import bit.project.server.dao.CivilstatusDao;
import bit.project.server.dao.SupplierstatusDao;
import bit.project.server.entity.Civilstatus;
import bit.project.server.entity.Supplierstatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/supplierstatuses")
public class supplierstatusController {

    @Autowired
    private SupplierstatusDao supplierstatusDao;

    @GetMapping
    public List<Supplierstatus> getAll(){
        return supplierstatusDao.findAll();
    }
}