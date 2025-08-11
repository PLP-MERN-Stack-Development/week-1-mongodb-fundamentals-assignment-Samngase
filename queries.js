// queries.js  – run with:  node queries.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('plp_bookstore');
    const books = db.collection('books');

    // 1️⃣  Find all books in a specific genre
    console.log('\nFiction:');
    console.log(await books.find({ genre: 'Fiction' }).toArray());

    // 2️⃣  Books published after 2000
    console.log('\nAfter 2000:');
    console.log(await books.find({ published_year: { $gt: 2000 } }).toArray());

    // 3️⃣  Books by George Orwell
    console.log('\nGeorge Orwell:');
    console.log(await books.find({ author: 'George Orwell' }).toArray());

    // 4️⃣  Update the price of “1984”
    await books.updateOne({ title: '1984' }, { $set: { price: 13.99 } });

    // 5️⃣  Delete “Moby Dick”
    await books.deleteOne({ title: 'Moby Dick' });

    // 6️⃣  In‑stock & published after 2010
    console.log('\nIn‑stock after 2010:');
    console.log(
      await books.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray()
    );

    // 7️⃣  Projection (title, author, price)
    console.log('\nProjection:');
    console.log(
      await books
        .find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } })
        .toArray()
    );

    // 8️⃣  Sort by price ↑
    console.log('\nPrice asc:');
    console.log(await books.find().sort({ price: 1 }).toArray());

    // 9️⃣  Sort by price ↓
    console.log('\nPrice desc:');
    console.log(await books.find().sort({ price: -1 }).toArray());

    // 🔟  Pagination – page 1
    console.log('\nPage 1:');
    console.log(await books.find().limit(5).toArray());

    // 1️⃣1️⃣  Pagination – page 2
    console.log('\nPage 2:');
    console.log(await books.find().skip(5).limit(5).toArray());

    // 1️⃣2️⃣  Average price by genre
    console.log('\nAvg price by genre:');
    console.log(
      await books
        .aggregate([{ $group: { _id: '$genre', avgPrice: { $avg: '$price' } } }])
        .toArray()
    );

    // 1️⃣3️⃣  Author with most books
    console.log('\nTop author:');
    console.log(
      await books
        .aggregate([
          { $group: { _id: '$author', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ])
        .toArray()
    );

    // 1️⃣4️⃣  Group by publication decade
    console.log('\nBy decade:');
    console.log(
      await books
        .aggregate([
          {
            $group: {
              _id: { $floor: { $divide: ['$published_year', 10] } },
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              decade: { $concat: [{ $toString: { $multiply: ['$_id', 10] } }, 's'] },
              count: 1,
              _id: 0
            }
          }
        ])
        .toArray()
    );

    // 1️⃣5️⃣  Indexes
    await books.createIndex({ title: 1 });
    await books.createIndex({ author: 1, published_year: 1 });

    // 1️⃣6️⃣  Explain plan for a title search
    console.log('\nExplain (title = "1984"):');
    console.log(await books.find({ title: '1984' }).explain('executionStats'));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();