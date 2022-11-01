package bit.project.server.dao;

import bit.project.server.entity.Purchase;
import bit.project.server.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.time.LocalDateTime;
import java.util.List;

@RepositoryRestResource(exported=false)
public interface SaleDao extends JpaRepository<Sale, Integer>{

    @Query("select new Sale (s.id, s.code, s.date) from Sale s")
    Page<Sale> findAllBasic(PageRequest pageRequest);

    @Query("select new Sale (p.id,p.code) from Sale p where p.tocreation >= :dateTime")
    List<Sale> findAllByTocreationAfter(@Param("dateTime") LocalDateTime dateTime);
    
}
