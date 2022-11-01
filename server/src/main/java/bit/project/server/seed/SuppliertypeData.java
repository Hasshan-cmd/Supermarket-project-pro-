package bit.project.server.seed;

import bit.project.server.util.seed.AbstractSeedClass;
import bit.project.server.util.seed.SeedClass;

@SeedClass
public class SuppliertypeData extends AbstractSeedClass {

    public SuppliertypeData(){
        addIdNameData(1, "Company");
        addIdNameData(2, "Individual");
    }

}