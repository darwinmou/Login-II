const express = require("express");
const router = express.Router();
const {productsModel} = require("../models/products.model");
const { validateProduct } = require("../utils.js/validations");

router.get("/", async (req, res) => {
  try {
   
    const { limit = 10, page = 1, sort, query } = req.query;
    const limitInt = parseInt(limit);
    const pageInt = parseInt(page);

    
    const options = {
      skip: (pageInt - 1) * limitInt,
      limit: limitInt,
      sort: sort === 'desc' ? { _id: -1 } : sort === 'asc' ? { _id: 1 } : null,
    };

    
    const filter = query ? { $text: { $search: query } } : {};

    
    const products = await productsModel.find(filter, null, options);

   
    const totalProducts = await productsModel.countDocuments(filter);

    
    const response = {
      status: 'success',
      payload: products,
      totalPages: Math.ceil(totalProducts / limitInt),
      prePage: pageInt > 1 ? pageInt - 1 : null,
      nextPage: pageInt < Math.ceil(totalProducts / limitInt) ? pageInt + 1 : null,
      page: pageInt,
      hasPrevPage: pageInt > 1,
      hasNextPage: pageInt < Math.ceil(totalProducts / limitInt),
    };

    res.json(response);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ status: 'error', error: "Error interno del servidor" });
  }
});

router.get("/:pid", async (req, res) => {
  const productId = req.params.pid;
  try {
    const product = await productsModel.findById(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado." });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: `Error al buscar producto: ${error.message}` });
  }

  
});

router.post("/", async (req, res) => {
  const productAdd = req.body;
  try {
    validateProduct(productAdd);
    const product = await productsModel.create(productAdd);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

router.put("/:pid", async (req, res) => {
  const id = req.params.pid;
  const productUpdate = req.body;
  try {
    const response = await productsModel.updateOne({ _id: id }, productUpdate);
    console.log(response);
    response.modifiedCount &&
      res.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error al actualizar" });
  }
});

router.delete("/:pid", async (req, res) => {
  const id = req.params.pid;

  try {
    const response = await productsModel.deleteOne({ _id: id });
    console.log(response);
    response.deletedCount &&
      res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error al borrar" });
  }
});

module.exports = router;
