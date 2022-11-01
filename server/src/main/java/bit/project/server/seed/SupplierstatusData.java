package bit.project.server.seed;

import bit.project.server.util.seed.AbstractSeedClass;
import bit.project.server.util.seed.SeedClass;

@SeedClass
public class SupplierstatusData extends AbstractSeedClass {

    public SupplierstatusData(){
        addIdNameData(1, "Active");
        addIdNameData(2, "Deactivated");
        addIdNameData(3, "Blocklisted");
    }

}