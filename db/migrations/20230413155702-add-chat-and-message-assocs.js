'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Chats', 'UserId',
      {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'Messages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    )

    await queryInterface.addColumn(
      'Messages', 'ChatId',
      {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'Chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chats', 'UserId')
    await queryInterface.removeColumn('Messages', 'UserId')
  }
};
