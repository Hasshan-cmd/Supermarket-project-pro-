package bit.project.server.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Salary {
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

    @ManyToOne
    private Employee employee;

    private LocalDate date;

    private BigDecimal amount;

    public Salary(Integer id, String code) {
        this.id = id;
        this.code = code;
    }

    public Salary(Integer id, String code, Employee employee, LocalDate date, BigDecimal amount) {
        this.id = id;
        this.code = code;
        this.employee = employee;
        this.date = date;
        this.amount = amount;
    }

}
