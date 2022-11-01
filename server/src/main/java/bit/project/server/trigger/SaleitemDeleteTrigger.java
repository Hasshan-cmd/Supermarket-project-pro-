package bit.project.server.trigger;

import bit.project.server.util.trigger.Trigger;

public class SaleitemDeleteTrigger extends Trigger {


    @Override
    public String getName() {
        return "saleitem_delete";
    }

    @Override
    public Event getEvent() {
        return Event.AFTER_DELETE;
    }

    @Override
    public String getTableName() {
        return "saleitem";
    }

    public SaleitemDeleteTrigger() {
        addBodyLine("update item set qty=qty+OLD.qty where id=OLD.item_id;");
    }
}
