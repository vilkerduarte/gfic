// lib/credits-manager.js
import prisma from './prisma.js';

class CreditsManager {
  /**
   * Adiciona créditos ao usuário
   * @param {number} userId - ID do usuário
   * @param {number} value - Valor em créditos (positivo)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado da transação
   */
  async addCredits(userId, value, options = {}) {
    if (value <= 0) {
      throw new Error('Valor deve ser positivo para adicionar créditos');
    }

    return await this.updateCredits(userId, value, 'add', options);
  }

  /**
   * Remove créditos do usuário
   * @param {number} userId - ID do usuário
   * @param {number} value - Valor em créditos (positivo)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado da transação
   */
  async removeCredits(userId, value, options = {}) {
    if (value <= 0) {
      throw new Error('Valor deve ser positivo para remover créditos');
    }

    return await this.updateCredits(userId, -value, 'remove', options);
  }

  /**
   * Atualiza créditos do usuário (método interno)
   */
  async updateCredits(userId, value, operation, options = {}) {
    const { expiresAt, description } = options;

    return await prisma.$transaction(async (tx) => {
      // Buscar usuário com lock
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, balance: true }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Calcular novo saldo
      const newBalance = user.balance + value;

      // Verificar se há saldo suficiente para remoção
      if (operation === 'remove' && newBalance < 0) {
        throw new Error('Saldo insuficiente');
      }

      // Buscar último saldo da tabela credits
      const lastCredit = await tx.credits.findFirst({
        where: { user_id: userId },
        orderBy: { id: 'desc' },
        select: { balance: true }
      });

      const previousBalance = lastCredit?.balance || 0;
      const creditBalance = previousBalance + value;

      // Criar registro na tabela credits
      const creditRecord = await tx.credits.create({
        data: {
          user_id: userId,
          value: value,
          balance: creditBalance,
          expires_at: expiresAt,
          status: 'active'
        }
      });

      // Atualizar balance do usuário
      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      });

      return {
        success: true,
        previousBalance: user.balance,
        newBalance,
        creditRecord,
        operation
      };
    });
  }

  /**
   * Obtém saldo atual do usuário
   */
  async getBalance(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    });

    return user?.balance || 0;
  }

  /**
   * Obtém extrato de créditos
   */
  async getStatement(userId, limit = 10) {
    return await prisma.credits.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        value: true,
        balance: true,
        created_at: true,
        status: true
      }
    });
  }
}

export default new CreditsManager();