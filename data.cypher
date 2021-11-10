MERGE (:entry:noun{id: 'fugol'});
MERGE (:entry:verb{id: 'fleugon'});
MERGE (:entry:noun{id: 'fisk'});
MERGE (:entry:noun{id: 'leib'});

MATCH (a:entry), (b:entry) WHERE a.id = 'fugol' AND b.id = 'fisk' CREATE (a)-[:see]->(b);
MATCH (a:entry), (b:entry) WHERE a.id = 'fleugon' AND b.id = 'fisk' CREATE (a)-[:see]->(b);

// Anything related to fisk
MATCH (a:entry), (b:entry) WHERE a.id = 'fisk' AND (b)-[]-(a) RETURN a, b;

MATCH(a:verb) RETURN a;
