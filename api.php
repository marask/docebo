<?php

require_once('classes/Database.php');
$db = new Database();

$data = json_decode(file_get_contents('php://input'), true);
$requestMethod = $_SERVER['REQUEST_METHOD'];
$response = array('data' => array(), 'errors' => array());

switch ($requestMethod) {

    case 'GET':
        $data = $_GET;
        // VALIDATE INPUT DATA
        $validationErrors = validate($data, $db);
        if (empty($validationErrors)) {
            // GATHER QUERY PARAMETERS FROM INPUT DATA
            $queryParams = array('node_id' => $data['node_id'], 'language' => $data['language']);
            if (isset($data['search'])) {
                $queryParams['search'] = $data['search'];
            }
            if (isset($data['page_num'])) {
                $queryParams['page_num'] = $data['page_num'];
            }
            if (isset($data['page_size'])) {
                $queryParams['page_size'] = $data['page_size'];
            }
            // RUN QUERY
            $results = $db->runQuery($queryParams);
            // POPULATE RESULTS ARRAY (IF ANY RESULT)
            if ($results && !empty($results)) {
                $response['data'] = $results;
            }

        } else {
            // POPULATE ERRORS ARRAY
            $response['errors'] = $validationErrors;
        }
        break;

    case 'POST':
    case 'PUT':
    case 'DELETE':
        // IF SUPPORTED, PROCESS DIFFERENT REQUEST TYPES HERE. IN THIS CASE, JUST RETURN ERROR.
        $response['errors'][] = $requestMethod . ' requests are not supported in this version!';
}

// RETURN RESPONSE
echo json_encode($response);

/**
 * @param array $data
 * @param Database $db
 * @return array
 */

function validate($data, $db)
{
    $errors = array();

    // VALIDATE NODE_ID
    if (!isset($data['node_id'])) {
        $errors[] = "Missing mandatory param: node_id";
    } else if (!is_numeric($data['node_id'])) {
        $errors[] = "Invalid node id format provided";
    } else if (!$db->checkIfNode($data['node_id'])) {
        $errors[] = "Invalid node id";
    }

    // VALIDATE LANGUAGE
    $allowedLangs = array('italian', 'english');
    if (!isset($data['language'])) {
        $errors[] = "Missing mandatory param: language";
    } else if (!in_array(strtolower($data['language']), $allowedLangs)) {
        $errors[] = '\'' . $data['language'] . '\' is not a supported language - only \'italian\' and \'english\' are allowed!';
    }

    // VALIDATE PAGE_NUM
    if (isset($data['page_num']) && !is_numeric($data['page_num'])) {
        $errors[] = "Invalid page number provided";
    }

    // VALIDATE PAGE_SIZE
    if (isset($data['page_size'])) {
        if (!is_numeric($data['page_size'])) {
            $errors[] = "Invalid page size provided";
        } elseif ($data['page_size'] < 0 || $data['page_size'] > 1000) {
            $errors[] = "Invalid page size provided";
        }
    }

    return $errors;
}

