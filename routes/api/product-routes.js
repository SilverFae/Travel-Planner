const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category data
  try {
    const productData = await Product.findAll({ include: [Category] });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category data
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [Category],
    });
    if (!productData) {
      res.status(404).json({ message: "No product found with id" });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create new product
  try {
    const productData = await Product.create(req.body);
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      // an array of objects 
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: productData.id,
          tag_id,
        };
      });
      console.log(productTagIdArr);
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update product data
  try {
    
    const productData = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    console.log(productData);
    if (req.body.tagIds && req.body.tagIds.length) {
      // find all associated tags from ProductTag
      const productTagsToRemove = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });
      // get list of current tag_ids
      const productTagIds = productTagsToRemove.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove.map(({ id }) => id) } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!productData) {
      res.status(404).json({ message: "No product found with this ID" });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
