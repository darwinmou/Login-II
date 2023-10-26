const express = require("express");
const router = express.Router();
const { cartsModel, productsModel } = require("../models/products.model");

router.post("/", async (req, res) => {

  try {
    const result = await cartsModel.create({ products: [] });
    res.send(result);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error:
          "Ocurrió un error en la validación, puede que el producto no exista o falten parametros (id, quantity requeridos)",
      });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await cartsModel.findById(cid).populate("products");

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    
    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    
    const product = await productsModel.findById(pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    
    const existingProductIndex = cart.products.findIndex(item => item.productId && item.productId.toString() === pid);

    if (existingProductIndex !== -1) {
      
      cart.products[existingProductIndex].quantity += 1;
    } else {
      
      cart.products.push({ productId: pid, quantity: 1 });
    }

    
    const updatedCart = await cart.save();

    res.json(updatedCart);
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    
    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productIdAsString = pid.toString();

    
    const existingProductIndex = cart.products.findIndex(item => item.productId && item.productId.toString() === productIdAsString);

    if (existingProductIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    
    cart.products.splice(existingProductIndex, 1);

    
    const updatedCart = await cart.save();

    res.json({ result: "success", payload: updatedCart });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

   
    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "La propiedad 'products' debe ser un arreglo" });
    }

   
    cart.products = [];

    
    for (const product of products) {
      const { id, quantity } = product; 

      
      const existingProduct = await productsModel.findById(id); 

      if (!existingProduct) {
        return res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
      }

      
      cart.products.push({ productId: existingProduct._id, quantity });
    }

    
    const updatedCart = await cart.save();

    res.json({payload: updatedCart });
  } catch (error) {
    console.error("Error al actualizar el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    
    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    
    const existingProductIndex = cart.products.findIndex(item => item.productId && item.productId.toString() === pid);

    if (existingProductIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    
    cart.products[existingProductIndex].quantity = quantity;

    
    const updatedCart = await cart.save();

    res.json({payload: updatedCart});
  } catch (error) {
    console.error("Error al actualizar la cantidad del producto en el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    
    const cart = await cartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    
    cart.products = [];

    
    const updatedCart = await cart.save();

    res.json({message: "Todos los productos del carrito han sido eliminados", payload: updatedCart });
  } catch (error) {
    console.error("Error al eliminar todos los productos del carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
