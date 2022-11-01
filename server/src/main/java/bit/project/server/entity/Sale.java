package bit.project.server.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Sale {

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

    private LocalDate date;

    private BigDecimal total;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Saleitem> saleitemList;

    public Sale(Integer id, String code) {
        this.id = id;
        this.code = code;
    }

    public Sale(Integer id, String code, LocalDate date) {
        this.id = id;
        this.code = code;
        this.date = date;
    }
}
