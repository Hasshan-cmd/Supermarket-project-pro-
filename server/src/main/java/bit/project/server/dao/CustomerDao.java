package bit.project.server.dao;

import bit.project.server.entity.Customer;
import bit.project.server.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.LocalDateTime;
import java.util.List;

@RepositoryRestResource(exported=false)
public interface CustomerDao extends JpaRepository<Customer, Integer>{

    @Query("select new Customer (c.id,c.code,c.name) from Customer c")
    Page<Customer> findAllBasic(PageRequest pageRequest);

    @Query("select new Customer (c.id,c.code,c.name) from Customer c where c.tocreation >= :dateTime")
    List<Customer> findAllByTocreationAfter(@Param("dateTime")LocalDateTime dateTime);

    Customer findByEmail(String email);
    Customer findByCode(String code);

}
