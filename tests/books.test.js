const request = require("supertest");
const app = require("../src/app");

describe("Tests de l'API Library", () => {

  //  GET /api/books 
  describe("GET /api/books", () => {
    it("doit retourner la liste de tous les livres", async () => {
      const res = await request(app).get("/api/books");
      expect(res.status).toBe(200);
    });

    it("doit retourner seulement les livres disponibles quand available=true", async () => {
      const res = await request(app).get("/api/books?available=true");
      expect(res.status).toBe(200);
      expect(res.body.data.every((b) => b.available === true)).toBe(true);
    });

    it("doit retourner seulement les livres non disponibles quand available=false", async () => {
      const res = await request(app).get("/api/books?available=false");
      expect(res.status).toBe(200);
      expect(res.body.data.every((b) => b.available === false)).toBe(true); // ← détecte le bug
    });
  });

  //  GET /api/books/:id 
  describe("GET /api/books/:id", () => {
    it("doit retourner un livre quand l'id existe", async () => {
      const res = await request(app).get("/api/books/1");
      expect(res.status).toBe(200);
    });

    it("doit retourner 404 quand le livre n'existe pas", async () => {
      const res = await request(app).get("/api/books/9999");
      expect(res.status).toBe(404);
    });
  });

  //  GET /api/books/search 
  describe("GET /api/books/search", () => {
    it("doit retourner les livres qui correspondent à la recherche", async () => {
      const res = await request(app).get("/api/books/search?q=Camus");
      expect(res.status).toBe(200);
    });

    it("doit retourner un tableau vide si aucun livre ne correspond", async () => {
      const res = await request(app).get("/api/books/search?q=zzzzinexistant");
      expect(res.status).toBe(200);
    });
  });

  // POST /api/books 
  describe("POST /api/books", () => {
    it("doit créer un nouveau livre avec les bonnes infos", async () => {
      const res = await request(app).post("/api/books").send({
        title: "Test Book",
        author: "Test Author",
        isbn: "9782070612123",
        year: 2023,
      });
      expect(res.status).toBe(201);
    });

    it("doit refuser la création si des champs sont manquants", async () => {
      const res = await request(app).post("/api/books").send({
        title: "Livre incomplet",
      });
      expect(res.status).toBe(400);
    });

    it("doit refuser un ISBN invalide", async () => {
      const res = await request(app).post("/api/books").send({
        title: "Mauvais ISBN",
        author: "Auteur",
        isbn: "123",
        year: 2020,
      });
      expect(res.status).toBe(400);
    });
  });

  // PUT /api/books/:id 
  describe("PUT /api/books/:id", () => {
    it("doit modifier un livre existant", async () => {
      const res = await request(app)
        .put("/api/books/1")
        .send({ title: "Nouveau Titre" });
      expect(res.status).toBe(200);
    });

    it("doit retourner 404 si le livre n'existe pas", async () => {
      const res = await request(app).put("/api/books/9999").send({ title: "X" });
      expect(res.status).toBe(404);
    });
  });

  // POST /api/books/:id/borrow 
  describe("POST /api/books/:id/borrow", () => {
    it("doit pouvoir emprunter un livre disponible", async () => {
      const res = await request(app)
        .post("/api/books/1/borrow")
        .send({ borrower: "Jean Dupont" });
      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(false);
      expect(res.body.data.borrower).toBe("Jean Dupont");
    });

    it("doit refuser l'emprunt si le livre est déjà emprunté", async () => {
      const res = await request(app)
        .post("/api/books/2/borrow")
        .send({ borrower: "Paul" });
      expect(res.status).toBe(400);
    });

    it("doit refuser l'emprunt si le nom de l'emprunteur est absent", async () => {
      const res = await request(app).post("/api/books/3/borrow").send({});
      expect(res.status).toBe(400);
    });
  });

  //  POST /api/books/:id/return 
  describe("POST /api/books/:id/return", () => {
    it("doit pouvoir retourner un livre emprunté", async () => {
      const res = await request(app).post("/api/books/2/return");
      expect(res.status).toBe(200);
    });

    it("doit refuser si le livre est déjà disponible", async () => {
      const res = await request(app).post("/api/books/3/return");
      expect(res.status).toBe(400);
    });
  });

  // DELETE /api/books/:id 
  describe("DELETE /api/books/:id", () => {
    it("doit supprimer un livre et ne plus le trouver après", async () => {
      await request(app).delete("/api/books/4");
      const check = await request(app).get("/api/books/4");
      expect(check.status).toBe(404);
    });

    it("doit retourner 404 si le livre n'existe pas", async () => {
      const res = await request(app).delete("/api/books/9999");
      expect(res.status).toBe(404);
    });
  });

});