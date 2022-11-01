package bit.project.server.seed;

import bit.project.server.util.seed.AbstractSeedClass;
import bit.project.server.util.seed.SeedClass;

@SeedClass
public class ItemstatusData extends AbstractSeedClass {

    public ItemstatusData(){
        addIdNameData(1, "Active");
        addIdNameData(2, "Deactivated");
    }

}