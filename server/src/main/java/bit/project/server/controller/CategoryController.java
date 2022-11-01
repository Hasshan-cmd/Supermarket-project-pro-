package bit.project.server.controller;

import bit.project.server.dao.CategoryDao;
import bit.project.server.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryDao categoryDao;

    @GetMapping
    public List<Category> getAll(){
        return categoryDao.findAll();
    }
}