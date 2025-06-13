export function data() {
  return [
    // Génération 1: Les fondateurs
    {
      "id": "0",
      "data": { "firstName": "Jean", "lastName": "Dubois", "gender": "M", "birthday": "1925", "death": "2005", "image": "placeholder.png", "occupation": "Menuisier", "generation": 1, "reliable": true },
      "rels": { "spouses": ["1"], "children": ["2", "3", "4"] }
    },
    {
      "id": "1",
      "data": { "firstName": "Marie", "lastName": "Leclerc", "gender": "F", "birthday": "1928", "death": "2010", "image": "placeholder.png", "occupation": "Couturière", "generation": 1, "reliable": true },
      "rels": { "spouses": ["0"], "children": ["2", "3", "4"] }
    },

    // Génération 2: Première branche (Enfants de Jean et Marie)
    {
      "id": "2",
      "data": { "firstName": "Pierre", "lastName": "Dubois", "gender": "M", "birthday": "1948", "death": "", "image": "placeholder.png", "occupation": "Professeur", "generation": 2, "reliable": true },
      "rels": { "mother": "1", "father": "0", "spouses": ["5"], "children": ["6", "7"] }
    },
    {
      "id": "5",
      "data": { "firstName": "Sophie", "lastName": "Martin", "gender": "F", "birthday": "1950", "death": "", "image": "placeholder.png", "occupation": "Infirmière", "generation": 2, "reliable": true },
      "rels": { "spouses": ["2"], "children": ["6", "7"] }
    },
    {
      "id": "3",
      "data": { "firstName": "Juliette", "lastName": "Dubois", "gender": "F", "birthday": "1952", "death": "", "image": "placeholder.png", "occupation": "Comptable", "generation": 2, "reliable": true },
      "rels": { "mother": "1", "father": "0", "spouses": ["8"], "children": ["9", "10", "11"] }
    },
    {
      "id": "8",
      "data": { "firstName": "Bernard", "lastName": "Lambert", "gender": "M", "birthday": "1951", "death": "2022", "image": "placeholder.png", "occupation": "Plombier", "generation": 2, "reliable": true },
      "rels": { "spouses": ["3"], "children": ["9", "10", "11"] }
    },
    {
      "id": "4",
      "data": { "firstName": "Alain", "lastName": "Dubois", "gender": "M", "birthday": "1955", "death": "2018", "image": "placeholder.png", "occupation": "Agriculteur", "generation": 2, "reliable": true },
      "rels": { "mother": "1", "father": "0", "spouses": ["12"], "children": ["13"] }
    },
    {
      "id": "12",
      "data": { "firstName": "Catherine", "lastName": "Girard", "gender": "F", "birthday": "1958", "death": "", "image": "placeholder.png", "occupation": "Agricultrice", "generation": 2, "reliable": true },
      "rels": { "spouses": ["4"], "children": ["13"] }
    },

    // Génération 3: Petits-enfants de la branche "Pierre Dubois"
    {
      "id": "6",
      "data": { "firstName": "Lucas", "lastName": "Dubois", "gender": "M", "birthday": "1975", "death": "", "image": "placeholder.png", "occupation": "Développeur Web", "generation": 3, "reliable": true },
      "rels": { "mother": "5", "father": "2", "spouses": ["14"], "children": ["15", "16"] }
    },
    {
      "id": "14",
      "data": { "firstName": "Élise", "lastName": "Petit", "gender": "F", "birthday": "1976", "death": "", "image": "placeholder.png", "occupation": "Designer UX", "generation": 3, "reliable": true },
      "rels": { "spouses": ["6"], "children": ["15", "16"] }
    },
    {
      "id": "7",
      "data": { "firstName": "Chloé", "lastName": "Dubois", "gender": "F", "birthday": "1978", "death": "", "image": "placeholder.png", "occupation": "Avocate", "generation": 3, "reliable": true },
      "rels": { "mother": "5", "father": "2", "spouses": ["17"], "children": ["18"] }
    },
    {
      "id": "17",
      "data": { "firstName": "Mathieu", "lastName": "Roux", "gender": "M", "birthday": "1977", "death": "", "image": "placeholder.png", "occupation": "Journaliste", "generation": 3, "reliable": true },
      "rels": { "spouses": ["7"], "children": ["18"] }
    },

    // Génération 3: Petits-enfants de la branche "Juliette Lambert"
    {
      "id": "9",
      "data": { "firstName": "Amélie", "lastName": "Lambert", "gender": "F", "birthday": "1979", "death": "", "image": "placeholder.png", "occupation": "Pharmacienne", "generation": 3, "reliable": true },
      "rels": { "mother": "3", "father": "8", "spouses": ["19"], "children": ["20", "21", "22"] }
    },
    {
      "id": "19",
      "data": { "firstName": "Thomas", "lastName": "Moreau", "gender": "M", "birthday": "1978", "death": "", "image": "placeholder.png", "occupation": "Médecin", "generation": 3, "reliable": true },
      "rels": { "spouses": ["9"], "children": ["20", "21", "22"] }
    },
    {
      "id": "10",
      "data": { "firstName": "Maxime", "lastName": "Lambert", "gender": "M", "birthday": "1982", "death": "", "image": "placeholder.png", "occupation": "Ingénieur", "generation": 3, "reliable": true },
      "rels": { "mother": "3", "father": "8", "spouses": ["23"], "children": ["24"] }
    },
    {
      "id": "23",
      "data": { "firstName": "Laura", "lastName": "Garcia", "gender": "F", "birthday": "1985", "death": "", "image": "placeholder.png", "occupation": "Architecte", "generation": 3, "reliable": true },
      "rels": { "spouses": ["10"], "children": ["24"] }
    },
    {
      "id": "11",
      "data": { "firstName": "David", "lastName": "Lambert", "gender": "M", "birthday": "1985", "death": "", "image": "placeholder.png", "occupation": "Chef Cuisinier", "generation": 3, "reliable": true },
      "rels": { "mother": "3", "father": "8", "spouses": [], "children": [] }
    },

    // Génération 3: Petits-enfants de la branche "Alain Dubois"
    {
      "id": "13",
      "data": { "firstName": "Manon", "lastName": "Dubois", "gender": "F", "birthday": "1980", "death": "", "image": "placeholder.png", "occupation": "Vétérinaire", "generation": 3, "reliable": false, "notes": "Père biologique incertain." },
      "rels": { "mother": "12", "father": "4", "spouses": ["25"], "children": ["26"] }
    },
    {
      "id": "25",
      "data": { "firstName": "Julien", "lastName": "Leroy", "gender": "M", "birthday": "1979", "death": "", "image": "placeholder.png", "occupation": "Gendarme", "generation": 3, "reliable": true },
      "rels": { "spouses": ["13"], "children": ["26"] }
    },

    // Génération 4: Arrière-petits-enfants (descendants de Lucas)
    {
      "id": "15",
      "data": { "firstName": "Hugo", "lastName": "Dubois", "gender": "M", "birthday": "2005", "death": "", "image": "placeholder.png", "occupation": "Étudiant", "generation": 4, "reliable": true },
      "rels": { "mother": "14", "father": "6", "spouses": [], "children": [] }
    },
    {
      "id": "16",
      "data": { "firstName": "Léa", "lastName": "Dubois", "gender": "F", "birthday": "2008", "death": "", "image": "placeholder.png", "occupation": "Écolière", "generation": 4, "reliable": true },
      "rels": { "mother": "14", "father": "6", "spouses": [], "children": [] }
    },

    // Génération 4: Arrière-petits-enfants (descendants de Chloé)
    {
      "id": "18",
      "data": { "firstName": "Emma", "lastName": "Roux", "gender": "F", "birthday": "2010", "death": "", "image": "placeholder.png", "occupation": "Écolière", "generation": 4, "reliable": true },
      "rels": { "mother": "7", "father": "17", "spouses": [], "children": [] }
    },

    // Génération 4: Arrière-petits-enfants (descendants d'Amélie)
    {
      "id": "20",
      "data": { "firstName": "Arthur", "lastName": "Moreau", "gender": "M", "birthday": "2007", "death": "", "image": "placeholder.png", "occupation": "Écolier", "generation": 4, "reliable": true },
      "rels": { "mother": "9", "father": "19", "spouses": [], "children": [] }
    },
    {
      "id": "21",
      "data": { "firstName": "Jules", "lastName": "Moreau", "gender": "M", "birthday": "2009", "death": "", "image": "placeholder.png", "occupation": "Écolier", "generation": 4, "reliable": true },
      "rels": { "mother": "9", "father": "19", "spouses": [], "children": [] }
    },
    {
      "id": "22",
      "data": { "firstName": "Alice", "lastName": "Moreau", "gender": "F", "birthday": "2012", "death": "", "image": "placeholder.png", "occupation": "Écolière", "generation": 4, "reliable": true },
      "rels": { "mother": "9", "father": "19", "spouses": [], "children": [] }
    },

    // Génération 4: Arrière-petits-enfants (descendants de Maxime)
    {
      "id": "24",
      "data": { "firstName": "Raphaël", "lastName": "Lambert", "gender": "M", "birthday": "2018", "death": "", "image": "placeholder.png", "occupation": "", "generation": 4, "reliable": true },
      "rels": { "mother": "23", "father": "10", "spouses": [], "children": [] }
    },

    // Génération 4: Arrière-petits-enfants (descendants de Manon)
    {
      "id": "26",
      "data": { "firstName": "Nathan", "lastName": "Leroy", "gender": "M", "birthday": "2006", "death": "", "image": "placeholder.png", "occupation": "Étudiant", "generation": 4, "reliable": true },
      "rels": { "mother": "13", "father": "25", "spouses": [], "children": [] }
    },
    
    // Ajout d'une autre famille pour atteindre le compte
    // Génération 1: Les fondateurs de la 2e famille
    {
      "id": "27",
      "data": { "firstName": "Louis", "lastName": "Chevalier", "gender": "M", "birthday": "1930", "death": "2008", "image": "placeholder.png", "occupation": "Ouvrier d'usine", "generation": 1, "reliable": true },
      "rels": { "spouses": ["28"], "children": ["29", "30"] }
    },
    {
      "id": "28",
      "data": { "firstName": "Simone", "lastName": "Roger", "gender": "F", "birthday": "1932", "death": "2015", "image": "placeholder.png", "occupation": "Femme au foyer", "generation": 1, "reliable": true },
      "rels": { "spouses": ["27"], "children": ["29", "30"] }
    },
    
    // Génération 2: Enfants de Louis et Simone
    {
      "id": "29",
      "data": { "firstName": "Françoise", "lastName": "Chevalier", "gender": "F", "birthday": "1954", "death": "", "image": "placeholder.png", "occupation": "Secrétaire", "generation": 2, "reliable": true },
      "rels": { "mother": "28", "father": "27", "spouses": ["31"], "children": ["32", "33"] }
    },
    {
      "id": "31",
      "data": { "firstName": "Robert", "lastName": "Garnier", "gender": "M", "birthday": "1952", "death": "", "image": "placeholder.png", "occupation": "Électricien", "generation": 2, "reliable": true },
      "rels": { "spouses": ["29"], "children": ["32", "33"] }
    },
    {
      "id": "30",
      "data": { "firstName": "Gérard", "lastName": "Chevalier", "gender": "M", "birthday": "1958", "death": "1999", "image": "placeholder.png", "occupation": "Chauffeur routier", "generation": 2, "reliable": true },
      "rels": { "mother": "28", "father": "27", "spouses": ["34"], "children": ["35"] }
    },
    {
      "id": "34",
      "data": { "firstName": "Nathalie", "lastName": "Blanc", "gender": "F", "birthday": "1960", "death": "", "image": "placeholder.png", "occupation": "Aide-soignante", "generation": 2, "reliable": true },
      "rels": { "spouses": ["30"], "children": ["35"] }
    },

    // Génération 3: Petits-enfants de la 2e famille
    {
      "id": "32",
      "data": { "firstName": "Céline", "lastName": "Garnier", "gender": "F", "birthday": "1978", "death": "", "image": "placeholder.png", "occupation": "Coiffeuse", "generation": 3, "reliable": true },
      "rels": { "mother": "29", "father": "31", "spouses": ["36"], "children": ["37"] }
    },
    {
      "id": "36",
      "data": { "firstName": "Stéphane", "lastName": "Vincent", "gender": "M", "birthday": "1977", "death": "", "image": "placeholder.png", "occupation": "Vendeur", "generation": 3, "reliable": true },
      "rels": { "spouses": ["32"], "children": ["37"] }
    },
    {
      "id": "33",
      "data": { "firstName": "Sébastien", "lastName": "Garnier", "gender": "M", "birthday": "1981", "death": "", "image": "placeholder.png", "occupation": "Mécanicien", "generation": 3, "reliable": true },
      "rels": { "mother": "29", "father": "31", "spouses": ["38"], "children": ["39", "40"] }
    },
    {
      "id": "38",
      "data": { "firstName": "Isabelle", "lastName": "Fournier", "gender": "F", "birthday": "1983", "death": "", "image": "placeholder.png", "occupation": "Institutrice", "generation": 3, "reliable": true },
      "rels": { "spouses": ["33"], "children": ["39", "40"] }
    },
    {
      "id": "35",
      "data": { "firstName": "Damien", "lastName": "Chevalier", "gender": "M", "birthday": "1985", "death": "", "image": "placeholder.png", "occupation": "Militaire", "generation": 3, "reliable": false, "notes": "Disparu en mission en 2015." },
      "rels": { "mother": "34", "father": "30", "spouses": [], "children": [] }
    },

    // Génération 4: Arrière-petits-enfants de la 2e famille
    {
      "id": "37",
      "data": { "firstName": "Zoé", "lastName": "Vincent", "gender": "F", "birthday": "2005", "death": "", "image": "placeholder.png", "occupation": "Étudiante", "generation": 4, "reliable": true },
      "rels": { "mother": "32", "father": "36", "spouses": [], "children": [] }
    },
    {
      "id": "39",
      "data": { "firstName": "Théo", "lastName": "Garnier", "gender": "M", "birthday": "2010", "death": "", "image": "placeholder.png", "occupation": "Écolier", "generation": 4, "reliable": true },
      "rels": { "mother": "38", "father": "33", "spouses": [], "children": [] }
    },
    {
      "id": "40",
      "data": { "firstName": "Sarah", "lastName": "Garnier", "gender": "F", "birthday": "2013", "death": "", "image": "placeholder.png", "occupation": "Écolière", "generation": 4, "reliable": true },
      "rels": { "mother": "38", "father": "33", "spouses": [], "children": [] }
    },
    
    // On connecte les deux familles pour le fun !
    // Hugo Dubois (15) se marie avec Zoé Vincent (37)
    {
      "id": "41",
      "data": { "firstName": "Gabriel", "lastName": "Dubois", "gender": "M", "birthday": "2028", "death": "", "image": "placeholder.png", "occupation": "", "generation": 5, "reliable": true },
      "rels": { "mother": "37", "father": "15", "spouses": [], "children": [] }
    },
    
    // On modifie Hugo et Zoé pour refléter leur union et leur enfant
    {
      "id": "15", // Re-déclaration pour modifier
      "data": { "firstName": "Hugo", "lastName": "Dubois", "gender": "M", "birthday": "2005", "death": "", "image": "placeholder.png", "occupation": "Étudiant", "generation": 4, "reliable": true },
      "rels": { "mother": "14", "father": "6", "spouses": ["37"], "children": ["41"] }
    },
    {
      "id": "37", // Re-déclaration pour modifier
      "data": { "firstName": "Zoé", "lastName": "Vincent", "gender": "F", "birthday": "2005", "death": "", "image": "placeholder.png", "occupation": "Étudiante", "generation": 4, "reliable": true },
      "rels": { "mother": "32", "father": "36", "spouses": ["15"], "children": ["41"] }
    },

    // Encore quelques personnes pour dépasser 50
    {
      "id": "42",
      "data": { "firstName": "Jacques", "lastName": "Mercier", "gender": "M", "birthday": "1953", "death": "2020", "image": "placeholder.png", "occupation": "Boulanger", "generation": 2, "reliable": true },
      "rels": { "spouses": ["43"], "children": ["44"] }
    },
    {
      "id": "43",
      "data": { "firstName": "Monique", "lastName": "Simon", "gender": "F", "birthday": "1955", "death": "", "image": "placeholder.png", "occupation": "Boulangère", "generation": 2, "reliable": true },
      "rels": { "spouses": ["42"], "children": ["44"] }
    },
    {
      "id": "44",
      "data": { "firstName": "Olivier", "lastName": "Mercier", "gender": "M", "birthday": "1980", "death": "", "image": "placeholder.png", "occupation": "Pâtissier", "generation": 3, "reliable": true },
      "rels": { "mother": "43", "father": "42", "spouses": ["11"], "children": [] } // Olivier se marie avec David Lambert (11)
    },
    {
      "id": "11", // Re-déclaration pour modifier
      "data": { "firstName": "David", "lastName": "Lambert", "gender": "M", "birthday": "1985", "death": "", "image": "placeholder.png", "occupation": "Chef Cuisinier", "generation": 3, "reliable": true },
      "rels": { "mother": "3", "father": "8", "spouses": ["44"], "children": [] }
    },
    {
      "id": "45",
      "data": { "firstName": "Paul", "lastName": "Fontaine", "gender": "M", "birthday": "1982", "death": "", "image": "placeholder.png", "occupation": "Musicien", "generation": 3, "reliable": true },
      "rels": { "spouses": [], "children": [] }
    },
    {
      "id": "46",
      "data": { "firstName": "Virginie", "lastName": "Aubert", "gender": "F", "birthday": "1988", "death": "", "image": "placeholder.png", "occupation": "Photographe", "generation": 3, "reliable": true },
      "rels": { "spouses": ["45"], "children": ["47", "48"] }
    },
    { // Il faut redéclarer Paul aussi pour mettre à jour sa relation
      "id": "45",
      "data": { "firstName": "Paul", "lastName": "Fontaine", "gender": "M", "birthday": "1982", "death": "", "image": "placeholder.png", "occupation": "Musicien", "generation": 3, "reliable": true },
      "rels": { "spouses": ["46"], "children": ["47", "48"] }
    },
    {
      "id": "47",
      "data": { "firstName": "Clara", "lastName": "Fontaine", "gender": "F", "birthday": "2015", "death": "", "image": "placeholder.png", "occupation": "", "generation": 4, "reliable": true },
      "rels": { "mother": "46", "father": "45", "spouses": [], "children": [] }
    },
    {
      "id": "48",
      "data": { "firstName": "Louis", "lastName": "Fontaine", "gender": "M", "birthday": "2019", "death": "", "image": "placeholder.png", "occupation": "", "generation": 4, "reliable": true },
      "rels": { "mother": "46", "father": "45", "spouses": [], "children": [] }
    },
    {
      "id": "49",
      "data": { "firstName": "Frédéric", "lastName": "Michel", "gender": "M", "birthday": "1975", "death": "", "image": "placeholder.png", "occupation": "Analyste Financier", "generation": 3, "reliable": true },
      "rels": { "spouses": [], "children": [] }
    },
    {
      "id": "50",
      "data": { "firstName": "Sylvie", "lastName": "Caron", "gender": "F", "birthday": "1956", "death": "", "image": "placeholder.png", "occupation": "Retraitée", "generation": 2, "reliable": true },
      "rels": { "spouses": [], "children": ["49"] }
    }
  ];
}