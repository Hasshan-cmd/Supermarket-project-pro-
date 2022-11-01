package bit.project.server.dao;

import bit.project.server.entity.Customer;
import bit.project.server.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported=false)
public interface SupplierDao extends JpaRepository<Supplier, Integer>{

    @Query("select new Supplier (s.id,s.code,s.name,s.supplierstatus) from Supplier s")
    Page<Supplier> findAllBasic(PageRequest pageRequest);

    Supplier findByEmail(String email);
    Customer findByCode(String code);
    Supplier findByName(String name);

    
}
