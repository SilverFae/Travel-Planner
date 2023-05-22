// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Products.belongsTo(Category, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
});
// Categories have many Products
Catagory.hasMany(Product, {
 foreignKey: 'product_id',
});
// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(ProductTag,{
  through: {
    model: Tag,
    unique: false
  },
  as: 'product_tag'
});
// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(ProductTag,{
  through: {
    foreignKey: 'tag_id'
  }
});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
