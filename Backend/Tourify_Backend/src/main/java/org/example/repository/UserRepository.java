package org.example.repository;

import org.example.model.AttractionDO;
import org.example.model.UserDO;
import org.springframework.stereotype.Repository;



/**
 * Description of the class.
 *
 * @author lvyongjie
 * @created 21/06/2023
 */
@Repository
public interface UserRepository {
    UserDO findUserByName(String userName);

}
