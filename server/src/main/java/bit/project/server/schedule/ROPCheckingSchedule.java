package bit.project.server.schedule;

import bit.project.server.dao.ItemDao;
import bit.project.server.entity.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableScheduling
@Component
public class ROPCheckingSchedule {

    @Autowired
    ItemDao itemDao;

    @Scheduled(cron = "0 0 21 ? * ?", zone = "Asia/Colombo")
    public void x(){
        List<Item> itemList = itemDao.findAll().stream().filter(item -> {
          int qty = item.getQty();
          int rop = item.getRop();
          return qty < rop;
        }).collect(Collectors.toList());
    }
}
