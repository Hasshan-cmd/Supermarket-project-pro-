package bit.project.server.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Item {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    private String code;

    private LocalDateTime tocreation;

    @Lob
    private String description;

    @ManyToOne
    @JsonIgnoreProperties({"creator","status","tocreation","roleList"})
    private User creator;

    private String name;

    private String photo;

    private Integer qty;

    private Integer rop;

    private BigDecimal price;

    @ManyToOne
    private Category category;

    @ManyToOne
    private Itemstatus itemstatus;

    @ManyToMany
    @JoinTable(
            name="itemsupplier",
            joinColumns=@JoinColumn(name="item_id", referencedColumnName="id"),
            inverseJoinColumns=@JoinColumn(name="supplier_id", referencedColumnName="id")
    )
    private List<Supplier> supplierList;

    @JsonIgnore
    @OneToMany(mappedBy = "item")
    private List<Purchaseitem> purchaseitemList;

    public Item(Integer id, String code) {
        this.id = id;
        this.code = code;
    }

    public Item(Integer id, String code, String name, BigDecimal price, Integer qty) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.price = price;
        this.qty = qty;
    }
}
