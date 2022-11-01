package bit.project.server.seed;

import bit.project.server.util.seed.AbstractSeedClass;
import bit.project.server.util.seed.SeedClass;

@SeedClass
public class CategoryData extends AbstractSeedClass {

    public CategoryData(){
        addIdNameData(1, "Diary Products");
        addIdNameData(2, "Chill Items");
        addIdNameData(3, "Grocery");
    }

}