<?php

class Database
{

    private $host;
    private $user;
    private $password;
    public $db;

    /**
     * Database constructor.
     * @param string $env
     */

    function __construct($env = 'test')
    {
        // GET DATABASE CONFIGURATION
        include('config.php');

        // SWITCH DB BASED ON CURRENT ENVIRONMENT
        switch ($env) {
            case 'test':
                $this->setHost(TEST_HOST);
                $this->setUser(TEST_USER);
                $this->setPassword(TEST_PWD);
                $this->setDb(TEST_DBNAME);
                break;
            case 'prod':
                $this->setHost(PROD_HOST);
                $this->setUser(PROD_USER);
                $this->setPassword(PROD_PWD);
                $this->setDb(PROD_DBNAME);
                break;
        }
    }

    /**
     * @return PDO|boolean
     */

    function connect()
    {
        try {
            $dbh = null;
            $retVal = null;
            $dbh = new PDO('mysql:host=' . $this->getHost() . ';dbname=' . $this->getDb() . ';charset=utf8;', $this->getUser(), $this->getPassword());
            if ($dbh) {
                $retVal = $dbh;
            }
        } catch (PDOException $e) {
            echo "DataBase Error: " . $e->getMessage();
        } catch (Exception $e) {
            echo "Application Error: " . $e->getMessage();
        }
        return $retVal;
    }

    /**
     * @param int $nodeId
     * @return boolean
     */

    function checkIfNode($nodeId){

        // CONNECT TO DATABASE
        $conn = $this->connect();

        // PREPARE QUERY
        $sql = 'SELECT * FROM node_tree WHERE idNode = :node';
        $args = array(':node' => $nodeId);
        $sth = $conn->prepare($sql);

        // EXECUTE QUERY
        $sth->execute($args);
        $rows = $sth->fetchColumn();

        // DISCONNECT FROM DATABASE
        unset($sth);
        unset($conn);

        // RETURN RESULT
        return $rows > 0;

    }

    /**
     * @param array $parameters
     * @return array
     */

    function runQuery($parameters)
    {

        // PROCESS INPUT DATA
        $nodeId = $parameters['node_id'];
        $language = $parameters['language'];
        $pageNum = 0;
        $pageSize = 100;
        $searchTerm = false;
        $searchSql = '';

        if (isset($parameters['page_num'])) {
            $pageNum = $parameters['page_num'];
        }
        if (isset($parameters['page_size'])) {
            $pageSize = $parameters['page_size'];
        }
        $offset = $pageNum * $pageSize;

        //CREATE SQL FOR SEARCH (IF NEEDED)
        if (isset($parameters['search'])) {
            $searchTerm = strtolower($parameters['search']);
            $searchSql = ' WHERE nodenames.nodeName LIKE :searchTerm ';
        }

        // CONNECT TO DATABASE
        $conn = $this->connect();

        // PREPARE QUERY
        $sql = "SELECT nodes.idNode, nodenames.nodeName
                    FROM (
                      SELECT Child.*
                      FROM node_tree AS Child, node_tree AS Parent
                      WHERE
                        Child.level = Parent.level + 1
                        AND Child.iLeft > Parent.iLeft
                        AND Child.iRight < Parent.iRight
                        AND Parent.iLeft = (SELECT iLeft FROM node_tree WHERE idNode = :node)
                    ) as nodes
                      JOIN node_tree_names as nodenames ON nodenames.idNode = nodes.idNode && nodenames.language = :lang
                      " . $searchSql . "LIMIT " . $pageSize . " OFFSET " . $offset;
        $sth = $conn->prepare($sql);

        $args = array(':node' => $nodeId, ':lang' => $language);
        if ($searchTerm) {
            $args[':searchTerm'] = '%'.$searchTerm.'%';
        }

        // EXECUTE QUERY
        $sth->execute($args);

        // PROCESS RESULTS
        $retVal = $sth->fetchAll(PDO::FETCH_ASSOC);
        if ($retVal && !empty($retVal)) {
            if (!isset($retVal[0])) {
                $retVal[0] = $retVal;
            }
        }

        // GET CHILDREN COUNT FOR EACH NODE
        foreach($retVal as &$item){
            $item['children'] = $this->getChildren($item['idNode']);
        }

        // DISCONNECT FROM DATABASE
        unset($sth);
        unset($conn);

        // RETURN RESULT
        return $retVal;

    }

    /**
     * @param int $nodeId
     * @return int
     */

    function getChildren($nodeId){

        $retVal = 0;

        // CONNECT TO DATABASE
        $conn = $this->connect();

        // PREPARE QUERY
        $sql = "SELECT COUNT(*)
                      FROM node_tree AS Child, node_tree AS Parent
                      WHERE
                        Child.level = Parent.level + 1
                        AND Child.iLeft > Parent.iLeft
                        AND Child.iRight < Parent.iRight
                        AND Parent.iLeft = (SELECT iLeft FROM node_tree WHERE idNode = :node)";
        $sth = $conn->prepare($sql);
        $args = array(':node' => $nodeId);

        // EXECUTE QUERY
        $sth->execute($args);

        // COUNT RESULTS
        $retVal = $sth->fetchColumn();

        // DISCONNECT FROM DATABASE
        unset($sth);
        unset($conn);

        //RETURN RESULT
        return $retVal;

    }

    // GETTERS AND SETTERS

    /**
     * @return string
     */
    public function getHost()
    {
        return $this->host;
    }

    /**
     * @param string $host
     */
    public function setHost($host)
    {
        $this->host = $host;
    }

    /**
     * @return string
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param string $user
     */
    public function setUser($user)
    {
        $this->user = $user;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     * @return string
     */
    public function getDb()
    {
        return $this->db;
    }

    /**
     * @param string $db
     */
    public function setDb($db)
    {
        $this->db = $db;
    }

}