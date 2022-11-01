package bit.project.server.controller;

import bit.project.server.UsecaseList;
import bit.project.server.dao.CustomerDao;
import bit.project.server.dao.ItemDao;
import bit.project.server.dao.PurchaseDao;
import bit.project.server.dao.SaleDao;
import bit.project.server.entity.Customer;
import bit.project.server.entity.Item;
import bit.project.server.entity.Purchase;
import bit.project.server.entity.Sale;
import bit.project.server.util.security.AccessControlManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    public CustomerDao customerDao;

    @Autowired
    public PurchaseDao purchaseDao;

    @Autowired
    public ItemDao itemDao;

    @Autowired
    public SaleDao saleDao;

    @Autowired
    public AccessControlManager accessControlManager;

    @GetMapping("/recent-customer-count")
    public HashMap getRecentCustomerCount(HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get recent customer count", UsecaseList.SHOW_ALL_CUSTOMERS);

        LocalDateTime timeWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Customer> recentCustomers = customerDao.findAllByTocreationAfter(timeWeekAgo);

        HashMap<String, Integer> data = new HashMap<>();

        data.put("count", recentCustomers.size());

        return data;
    }

    @GetMapping("/recent-purchase-count")
    public HashMap getRecentPurchaseCount(HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get recent purchase count", UsecaseList.SHOW_ALL_PURCHASES);

        LocalDateTime timeWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Purchase> recentPurchases = purchaseDao.findAllByTocreationAfter(timeWeekAgo);

        HashMap<String, Integer> data = new HashMap<>();

        data.put("count", recentPurchases.size());

        return data;
    }

    @GetMapping("/recent-item-count")
    public HashMap getRecentItemCount(HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get recent item count", UsecaseList.SHOW_ALL_ITEMS);

        LocalDateTime timeWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Item> recentItems = itemDao.findAllByTocreationAfter(timeWeekAgo);

        HashMap<String, Integer> data = new HashMap<>();

        data.put("count", recentItems.size());

        return data;
    }

    @GetMapping("/recent-sale-count")
    public HashMap getRecentSaleCount(HttpServletRequest request){
        accessControlManager.authorize(request, "No privilege to get recent sale count", UsecaseList.SHOW_ALL_SALES);

        LocalDateTime timeWeekAgo = LocalDateTime.now().minusWeeks(1);
        List<Sale> recentSales = saleDao.findAllByTocreationAfter(timeWeekAgo);

        HashMap<String, Integer> data = new HashMap<>();

        data.put("count", recentSales.size());

        return data;
    }

}
