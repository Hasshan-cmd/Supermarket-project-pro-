package bit.project.server.dao;

import bit.project.server.entity.Customer;
import bit.project.server.entity.Salary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.LocalDateTime;
import java.util.List;

@RepositoryRestResource(exported=false)
public interface SalaryDao extends JpaRepository<Salary, Integer>{

    @Query("select new Salary (sa.id,sa.code,sa.employee,sa.date,sa.amount) from Salary sa")
    Page<Salary> findAllBasic(PageRequest pageRequest);

    @Query("select new Salary (sa.id,sa.code) from Salary sa where sa.tocreation >= :dateTime")
    List<Salary> findAllByTocreationAfter(@Param("dateTime") LocalDateTime dateTime);

    Customer findByCode(String code);

}
