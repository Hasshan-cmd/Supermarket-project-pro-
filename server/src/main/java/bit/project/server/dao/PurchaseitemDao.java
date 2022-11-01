package bit.project.server.dao;

import bit.project.server.entity.Purchaseitem;
import bit.project.server.entity.Saleitem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported=false)
public interface PurchaseitemDao extends JpaRepository<Purchaseitem, Integer>{
}
