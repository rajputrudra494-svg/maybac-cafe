/*
  Maybac menu, transcribed from the in-house menu cards (Zomato upload, 2026).
  j: true   -> available in Jain
  sig: true -> Maybac signature / chef special (the little bow-tie mark)
  Prices in INR.
*/
window.MAYBAC_MENU = {
  kitchen: {
    label: "Kitchen",
    note: "Everything here is vegetarian. Ask us for Jain — most of it can be made without onion & garlic.",
    sections: [
      { title: "Salads", items: [
        { n: "Greek Salad", p: 440, j: true, d: "Fresh tomatoes, cucumber, onion, olives & feta tossed in olive oil & oregano" },
        { n: "Watermelon Feta", p: 440, j: true, d: "Honey-mint dressing with watermelon, lettuce & feta" },
        { n: "Summer Roll", p: 470, j: true, d: "Rice paper rolls with fresh veggies, carrot, cucumber, spring onion, tofu & lettuce" }
      ]},
      { title: "Handhelds", items: [
        { n: "Aloo Tikki Burger", p: 420, j: true, d: "In-house bun & tikki with cheesy spicy sauce & fresh veggies" },
        { n: "Crispy Paneer Burger", p: 490, j: true, d: "Tempura paneer, iceberg & lollo rosso, layered with cheese in a soft house bun" },
        { n: "Avocado Toast", p: 460, j: true, d: "Guacamole, lollo rosso & avocado slices, salt, pepper & lemon" },
        { n: "Pesto Burrata Toast", p: 440, j: true, d: "Basil pesto & sun-dried tomatoes with creamy burrata" },
        { n: "Mushroom Ricotta Toast", p: 410, d: "Creamy mushroom with our in-house ricotta" },
        { n: "Paneer Tikka Toast", p: 460, j: true, d: "Smoky tandoori paneer & paneer keema on crisp toast, signature sauces" },
        { n: "Pesto Bagel Bun", p: 360, j: true, d: "Toasted bagel, crazy pesto spread, cream cheese & fresh veggies" }
      ]},
      { title: "Mains", items: [
        { n: "Fried Rice", p: 440, j: true, d: "Jasmine rice with edamame, bell peppers, beans, carrot & corn" },
        { n: "Burnt Garlic Rice", p: 530, d: "Burnt garlic fried rice with vegetables, creamy cheese sauce on the side" },
        { n: "Green Thai Curry with Sesame Rice", p: 480, j: true, d: "Thai herb paste in coconut milk, bell pepper, baby corn, mushroom & zucchini" },
        { n: "Mexican Curry with Cumin Rice", p: 590, j: true, d: "Creamy tomato curry with kidney beans, peppers & chilli" }
      ]},
      { title: "Pasta", kicker: "Italian", items: [
        { n: "Aglio e Olio Spaghetti", p: 490, j: true, d: "Garlic-infused olive oil, chilli flakes & fresh herbs" },
        { n: "Arrabbiata", p: 510, j: true, d: "Penne or spaghetti · spicy cherry tomato, garlic & chilli" },
        { n: "Alfredo", p: 530, j: true, d: "Penne or spaghetti · in-house alfredo cheese sauce, olives & peppers" },
        { n: "Crazy Pesto", p: 560, j: true, d: "Penne or spaghetti · pesto with beans & pine nuts" },
        { n: "Mushroom Fettuccine", p: 580, d: "Button mushroom sauce with a flavourful foam" },
        { n: "Pink Sauce", p: 560, j: true, d: "Penne or spaghetti · cherry tomato & fresh cream" }
      ]},
      { title: "Pizza", kicker: "Italian", items: [
        { n: "Maybac Margherita", p: 730, j: true, d: "Our twist on the classic — mozzarella, tomato & fresh basil" },
        { n: "Funghi e Tartufo", p: 760, d: "Mushroom-sauce base, red chilli, sliced garlic & onion" },
        { n: "Third Wave", p: 740, j: true, d: "Pomodoro, broccoli, garlic, onion, olives, green chilli & baby corn" },
        { n: "Burrata e Pesto", p: 790, j: true, d: "Creamy burrata, basil pesto & cherry tomatoes on an artisan crust" },
        { n: "Tandoori Paneer Pizza", p: 840, j: true, d: "Tandoori mayo, house paneer, onion rings, peppers, jalapeño & corn" }
      ]},
      { title: "Risotto", kicker: "Italian", items: [
        { n: "Pomodoro", p: 610, j: true, d: "Slow-cooked arborio in a classic pomodoro, herb-infused" },
        { n: "Mushroom", p: 640, d: "Porcini & toasted mushroom, finished with foam" }
      ]},
      { title: "Lebanese", foot: "Extra pita bread or falafel bullets — ₹80", items: [
        { n: "Hummus Platter", p: 530, j: true, d: "Creamy hummus, in-house pita & our crispy falafel bullets" },
        { n: "Beetroot Hummus Platter", p: 560, j: true, d: "The pink one. Beetroot hummus, fresh pita & falafel bullets" }
      ]},
      { title: "Asian", items: [
        { n: "Jalapeño Poppers Sushi", p: 710, j: true, d: "Cream-cheese jalapeños, tempura-fried, spring onion, coriander & unagi sauce" },
        { n: "Creamy Avocado Sushi", p: 680, j: true, d: "Cream cheese, avocado & cucumber, unagi sauce" },
        { n: "Asparagus Sushi", p: 620, j: true, d: "Tempura asparagus with cream cheese & vegetables" },
        { n: "Spicy Tofu Sushi", p: 670, j: true, d: "Silken tofu, purple cabbage, carrot & spring onion" },
        { n: "Butterfly Pea Roll Sushi", p: 710, j: true, d: "Blue butterfly-pea rice, cheese-stuffed jalapeño tempura" },
        { n: "Shoyu Ramen", p: 490, d: "Soy broth, corn, bok choy, edamame, peppers & spring onion" },
        { n: "Spicy Peanut Butter Ramen", p: 510, j: true, d: "Spicy miso-coconut broth, edamame, peanuts & bok choy" },
        { n: "Spicy Miso Ramen", p: 530, j: true, d: "Miso-coconut broth, bok choy, edamame, coriander & lemon" }
      ]},
      { title: "Bites", items: [
        { n: "Maybac Trio Platter", p: 460, d: "Nachos, peri peri fries & zucchini fries with salsa, mint & spicy mayo" },
        { n: "Maybac Style Avocado Tostadas", p: 390, j: true, d: "Crisp pastry, creamy avocado, fresh salsa & sour cream" },
        { n: "Salted Fries", p: 260 },
        { n: "Peri Peri Fries", p: 280 },
        { n: "Loaded Fries", p: 360, d: "In-house chimichurri, cheesy sauce, jalapeño & salsa" },
        { n: "Guacamole Loaded Nachos", p: 420, j: true },
        { n: "Loaded Nachos", p: 340, j: true, d: "Chimichurri, cheesy sauce, jalapeño & salsa" },
        { n: "Corn Ribs", p: 260, j: true, d: "Tossed in our in-house spice blend" }
      ]}
    ]
  },

  patisserie: {
    label: "Pâtisserie",
    note: "The counter changes with the season — ask what came out of the oven this morning.",
    sections: [
      { title: "Maybac Specials", special: true, items: [
        { n: "Sleeping Teddy Mousse", p: 540, sig: true, d: "Fluffy, dreamy chocolate — like a hug from a teddy bear. 54% chocolate & cream" },
        { n: "Chocolate Raclette Slice", p: 540, sig: true, d: "Chocolate cake finished with melted chocolate raclette" },
        { n: "Classic Sticky Toffee Delight", p: 420, sig: true, d: "Warm toffee pudding, vanilla ice cream & toffee sauce" },
        { n: "Pistachio Toodstool", p: 490, sig: true, d: "A whimsical pistachio treat — creamy, nutty & fun" },
        { n: "Matilda Cake", p: 520, d: "Fudgy sponge drowned in fudge sauce. Bruce Bogtrotter would approve" },
        { n: "Pistachio Kunafa Bomb", p: 540, d: "Crunchy kataifi stuffed with pistachio & cheese — the OG from Dubai" },
        { n: "Classic Tiramisu", p: 430, d: "Mascarpone, coffee-soaked fingers & a dusting of cocoa" },
        { n: "Classic French Toast", p: 390, d: "Golden and crisp outside, soft within" },
        { n: "Kesar Pista Tres Leches", p: 420, d: "Saffron & pistachio, soaked in three milks" },
        { n: "Biscoff Tres Leches", p: 420, d: "Vanilla sponge, three milks, whipped cream & Biscoff" },
        { n: "Rose & Pistachio Tres Leches", p: 410, d: "Milk sponge with rose, crunchy pistachios on top" },
        { n: "Pistachio Tres Leches", p: 410, d: "Pistachio sponge, three milks, crushed pistachio" }
      ]},
      { title: "Cookies", items: [
        { n: "Nutella New York Style", p: 320, d: "Chunky, gooey, stuffed with melty Nutella" },
        { n: "Biscoff New York Style", p: 340, d: "Chocolate chunks & a warm Biscoff centre" },
        { n: "Pistachio New York Style", p: 340, d: "Thick, chewy, loaded with roasted pistachio" }
      ]},
      { title: "Croissants", items: [
        { n: "Almond Magnum", p: 520, d: "Flaky croissant stuffed with a whole Almond Magnum bar, finished with Nutella" },
        { n: "Pistachio Magnum", p: 520, d: "Filled with a Magnum Pistachio bar & Nutella" }
      ]},
      { title: "Brownie", items: [
        { n: "Classic Brownie with Ice Cream", p: 380 },
        { n: "Nutella Brownie", p: 380 },
        { n: "Biscoff Brownie", p: 420, d: "Layered with Biscoff cream & cookie crumble" },
        { n: "Brownie Tub", p: 520, d: "Brownie bites under dark, milk & white molten chocolate" },
        { n: "Pistachio Kunafa Brownie", p: 420, d: "Fudgy brownie, crunchy kunafa & pistachio cream" }
      ]},
      { title: "Cheesecake", items: [
        { n: "New York Style", p: 320, d: "The OG — smooth, rich, buttery base" },
        { n: "Blueberry", p: 360 },
        { n: "Nutella", p: 360 },
        { n: "Biscoff", p: 420 },
        { n: "Signature Burnt Basque Cheesecake", p: 420, sig: true, d: "With Nutella sauce or melted chocolate raclette" }
      ]},
      { title: "Mousse", items: [
        { n: "Coffee", p: 520 }, { n: "Nutty Chocolate", p: 520 }, { n: "Biscoff", p: 520 }, { n: "Passion Fruit", p: 520 }
      ]},
      { title: "Pull-up Pancakes", items: [
        { n: "Biscoff", p: 520, d: "Caramelised Biscoff sauce & biscuit crumble" },
        { n: "Nutella", p: 520, d: "A warm Nutella pour" },
        { n: "Pistachio Kunafa", p: 520, d: "Pistachio cream, crisp kunafa & a silky sweet pour" }
      ]},
      { title: "Waffles", items: [
        { n: "Red Velvet", p: 340 }, { n: "Nutella", p: 380 }, { n: "Triple Chocolate", p: 420 }, { n: "Biscoff", p: 460 }
      ]}
    ]
  },

  bar: {
    label: "Coffee & Bar",
    note: "Oat or almond milk on anything — ₹70. Syrups (vanilla, hazelnut, irish, caramel) — ₹40.",
    sections: [
      { title: "Hot Coffee", items: [
        { n: "Espresso", p: 140 }, { n: "Americano", p: 210 }, { n: "Cappuccino", p: 270 },
        { n: "Flat White", p: 240 }, { n: "Cafe Latte", p: 270 },
        { n: "Biscoff Latte", p: 370, sig: true }, { n: "Hot Spanish Latte", p: 290, sig: true },
        { n: "Cafe Mocha", p: 310 }
      ]},
      { title: "Iced Coffee", items: [
        { n: "Iced Espresso", p: 170 }, { n: "Iced Americano", p: 240 }, { n: "Iced Latte", p: 270 },
        { n: "Iced Cappuccino", p: 290 }, { n: "Iced Honey Cinnamon Latte", p: 330 },
        { n: "Iced Vietnamese", p: 280, sig: true, d: "Espresso" },
        { n: "Vietnamese Sekrato", p: 340, sig: true, d: "Cold brew" },
        { n: "Iced Spanish Latte", p: 320 }, { n: "Iced Cafe Mocha", p: 320 }
      ]},
      { title: "Cold Brew", items: [
        { n: "Classic Cold Brew", p: 260, d: "Sangria-inspired — dark berry, a hint of oak & spice" },
        { n: "Cold Brew Tonic", p: 320 }, { n: "Barrel Aged Cold Brew", p: 290 },
        { n: "Barrel Aged Tonic", p: 360 }, { n: "Cold Brew with Red Bull", p: 360 },
        { n: "Cold Brew Lemonade", p: 320 }, { n: "Orange Cold Brew Tonic", p: 360 },
        { n: "Old Fashioned", p: 340 }
      ]},
      { title: "Manual Brew", items: [
        { n: "Chemex", p: 310 }, { n: "Pour Over", p: 280, sig: true },
        { n: "Aeropress", p: 280, sig: true }, { n: "French Press", p: 280 }
      ]},
      { title: "Espresso Based", items: [
        { n: "Espresso Tonic", p: 320 }, { n: "Espresso Orange Tonic", p: 340 },
        { n: "Cranberry Espresso Tonic", p: 340 }, { n: "Espresso Ginger Ale", p: 320 },
        { n: "Red Bull with Espresso", p: 360 }
      ]},
      { title: "Affogato", items: [
        { n: "Classic Affogato", p: 280 }, { n: "KitKat Nutella Affogato", p: 360 }, { n: "Brownie Gato", p: 360 }
      ]},
      { title: "Matcha Mood", items: [
        { n: "Hot Matcha", p: 320 }, { n: "Iced Matcha", p: 360 }, { n: "Coconut Matcha", p: 370 },
        { n: "Strawberry Matcha", p: 370 }, { n: "Mango Matcha", p: 370 }, { n: "Blueberry Matcha", p: 370 },
        { n: "Iced Matcha with Almond Milk", p: 420, sig: true }
      ]},
      { title: "Mocktails", items: [
        { n: "Classic Mojito", p: 280 }, { n: "Cranberry", p: 280 }, { n: "Orange Basil", p: 310 },
        { n: "Chilli Guava", p: 290, sig: true }, { n: "Blue Lagoon", p: 310 }, { n: "Pink Lady", p: 310 },
        { n: "Maybac Special", p: 340, sig: true }, { n: "Pomegranate Basil", p: 340 },
        { n: "Orange Marry", p: 340, sig: true }, { n: "Piña Colada", p: 360, sig: true }
      ]},
      { title: "Iced Tea", items: [
        { n: "Lemon Iced Tea", p: 260 }, { n: "Peach Iced Tea", p: 260 },
        { n: "Yuzu Iced Tea", p: 280, sig: true }, { n: "Red Bull Iced Tea", p: 320, sig: true }
      ]},
      { title: "Shakes", items: [
        { n: "Oreo Shake", p: 310 }, { n: "Nutella Shake", p: 330 }, { n: "Biscoff Shake", p: 360, sig: true },
        { n: "Brownie Shake", p: 360, sig: true }, { n: "Pistachio Kunafa Shake", p: 420, sig: true },
        { n: "Nutella KitKat Shake", p: 410, sig: true }
      ]},
      { title: "Frappés", items: [
        { n: "Classic Frappé", p: 270 }, { n: "Mocha Frappé", p: 280 },
        { n: "Nutella Frappé", p: 320, sig: true }, { n: "Biscoff Frappé", p: 320, sig: true }
      ]},
      { title: "Hot Chocolate", items: [
        { n: "OG Hot Chocolate", p: 310, sig: true }, { n: "Hazelnut Hot Chocolate", p: 340, sig: true },
        { n: "Nutella Hot Chocolate", p: 340, sig: true }
      ]},
      { title: "Smoothie Bowls", items: [
        { n: "Mix Berry", p: 390, sig: true, d: "Strawberry, blueberry, raspberry & soya milk" },
        { n: "Mango", p: 420, sig: true, d: "Mango, banana & almond milk" },
        { n: "Avocado Honey Crunch", p: 420, d: "Avocado, banana, honey, nuts & seeds" },
        { n: "Banoffee Smoothie Bowl", p: 420, d: "Banana, Biscoff, almond milk & vanilla ice cream" }
      ]},
      { title: "Additionals", items: [
        { n: "Coke · Diet Coke · Coke Zero · Ginger Ale · Tonic · Orange Tonic", p: 110 },
        { n: "Red Bull", p: 180 }
      ]}
    ]
  }
};
