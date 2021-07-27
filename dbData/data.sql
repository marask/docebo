INSERT INTO node_tree (level, iLeft, iRight)
  VALUES (2, 2, 3), (2, 4, 5), (2, 6, 7), (2, 8, 9), (1, 1, 24), (2, 20, 11), (2, 12, 19), (3, 15, 16), (3, 17, 18), (2, 20, 21), (3, 13, 14), (2, 22, 23);

INSERT INTO node_tree_names (idNode, language, nodeName)
  VALUES
    (1, 'english', 'Marketing'), (1, 'italian', 'Marketing'),
    (2, 'english', 'Helpdesk'), (2, 'italian', 'Supporto tecnico'),
    (3, 'english', 'Managers'), (2 , 'italian', 'Managers'),
    (4, 'english', 'Customer Account'), (4, 'italian', 'Assistenza Cliente'),
    (5, 'english', 'Docebo'), (5, 'italian', 'Docebo'),
    (6, 'english', 'Accounting'), (6, 'italian', 'Amministrazione'),
    (7, 'english', 'Sales'), (7, 'italian', 'Supporto Vendite'),
    (8, 'english', 'Italy'), (8, 'italian', 'Italia'),
    (9, 'english', 'Europe'), (9, 'italian', 'Europa'),
    (10, 'english', 'Developers'), (10, 'italian', 'Sviluppatori'),
    (11, 'english', 'North America'), (11, 'italian', 'Nord America'),
    (12, 'english', 'Quality Assurance'), (12, 'italian', 'Controllo Qualità');