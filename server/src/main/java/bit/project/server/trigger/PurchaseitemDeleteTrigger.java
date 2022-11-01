package bit.project.server.trigger;

import bit.project.server.util.trigger.Trigger;

public class PurchaseitemDeleteTrigger extends Trigger {


    @Override
    public String getName() {
        return "purchaseitem_delete";
    }

    @Override
    public Event getEvent() {
        return Event.AFTER_DELETE;
    }

    @Override
    public String getTableName() {
        return "purchaseitem";
    }

    public PurchaseitemDeleteTrigger() {
        addBodyLine("update item set qty=qty-OLD.qty where id=OLD.item_id;");
    }
}
