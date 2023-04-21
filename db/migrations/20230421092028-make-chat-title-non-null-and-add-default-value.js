'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE "Chats"
       SET "title" = 'Untitled Chat'
       WHERE "title" IS NULL;`
    )
    await queryInterface.changeColumn(
      'Chats', 'title',
      {
        type: Sequelize.TEXT,
        defaultValue: 'Untitled Chat',
        allowNull: false,
      }
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'Chats', 'title',
      { type: Sequelize.TEXT, }
    )
  }
};
