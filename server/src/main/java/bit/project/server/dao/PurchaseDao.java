package bit.project.server.dao;

import bit.project.server.entity.Customer;
import bit.project.server.entity.Purchase;
import bit.project.server.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.LocalDateTime;
import java.util.List;

@RepositoryRestResource(exported=false)
public interface PurchaseDao extends JpaRepository<Purchase, Integer>{

    @Query("select new Purchase (p.id,p.code,p.supplier,p.date) from Purchase p")
    Page<Purchase> findAllBasic(PageRequest pageRequest);

    @Query("select new Purchase (p.id,p.code) from Purchase p where p.tocreation >= :dateTime")
    List<Purchase> findAllByTocreationAfter(@Param("dateTime") LocalDateTime dateTime);

    Customer findByCode(String code);

}
