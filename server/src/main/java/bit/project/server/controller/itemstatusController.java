package bit.project.server.controller;

import bit.project.server.dao.ItemstatusDao;
import bit.project.server.entity.Itemstatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/itemstatuses")
public class itemstatusController {

    @Autowired
    private ItemstatusDao itemstatusDao;

    @GetMapping
    public List<Itemstatus> getAll(){
        return itemstatusDao.findAll();
    }
}