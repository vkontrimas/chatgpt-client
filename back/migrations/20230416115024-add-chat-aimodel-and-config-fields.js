'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Chats', 'aiModelName',
      {
        type: Sequelize.STRING,
        allowNull: false,
      }
    )
    queryInterface.addColumn('Chats', 'aiModelConfig', Sequelize.STRING)
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('Chats', 'aiModelName')
    queryInterface.removeColumn('Chats', 'aiModelConfig')
  }
};
