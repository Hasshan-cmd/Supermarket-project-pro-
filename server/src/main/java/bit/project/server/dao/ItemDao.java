package bit.project.server.dao;

import bit.project.server.entity.Customer;
import bit.project.server.entity.Item;
import bit.project.server.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import javax.persistence.Tuple;
import java.time.LocalDateTime;
import java.util.List;

@RepositoryRestResource(exported=false)
public interface ItemDao extends JpaRepository<Item, Integer>{

    @Query("select new Item (i.id,i.code,i.name,i.price, i.qty) from Item i")
    Page<Item> findAllBasic(PageRequest pageRequest);
    @Query(value = "select i.id from item i inner join itemsupplier isp on isp.item_id=i.id inner join supplier s on s.id = isp.supplier_id where s.id=:supplierId", nativeQuery = true)
    List<Tuple> findAllBasicBySupplier(@Param("supplierId") Integer supplierId);

    @Query("select new Item (p.id,p.code) from Item p where p.tocreation >= :dateTime")
    List<Item> findAllByTocreationAfter(@Param("dateTime") LocalDateTime dateTime);
    Item findByName(String name);
    Customer findByCode(String code);

}
