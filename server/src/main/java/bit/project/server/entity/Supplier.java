package bit.project.server.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Supplier {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    private String code;

    private LocalDateTime tocreation;

    @Lob
    private String description;

    private String name;

    private String logo;

    private String contact1;

    private String contact2;

    @Lob
    private String address;

    private String email;

    private String fax;

    @ManyToOne
    private Suppliertype suppliertype;

    @ManyToOne
    private Supplierstatus supplierstatus;

    @JsonIgnore
    @ManyToMany(mappedBy = "supplierList")
    private List<Item> itemList;

    @JsonIgnore
    @OneToMany(mappedBy = "supplier")
    private List<Purchase> purchaseList;

    @ManyToOne
    @JsonIgnoreProperties({"creator","status","tocreation","roleList"})
    private User creator;

    public Supplier(Integer id) {
        this.id = id;
    }

    public Supplier(Integer id, String code, String name, Supplierstatus supplierstatus) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.supplierstatus = supplierstatus;
    }
}
