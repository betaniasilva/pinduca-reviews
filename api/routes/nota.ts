import { PrismaClient, Role } from '@prisma/client'
import { Router, Response } from 'express'
import { z } from 'zod'
import authMiddleware, { RequestWithAuth } from '../middleware/authMiddleware';

const prisma = new PrismaClient()
const router = Router()

const notaSchema = z.object({
    id: z.number().optional(), 
    gibiId: z.number(),
    avaliacao: z.number().min(1).max(5, { message: "Avaliação deve ser entre 1 e 5" }),
})

router.get("/:gibiId", async (req, res) => {
    const { gibiId } = req.params

    try {
        const notas = await prisma.nota.findMany({
            where: { gibiId: Number(gibiId) }
        })
        res.status(200).json(notas)
    } catch (error) {
        console.error("Erro ao obter notas:", error)
        res.status(500).json({ erro: "Erro ao obter notas" })
    }
})

router.post("/", authMiddleware, async (req, res) => {
    const valida = notaSchema.safeParse(req.body)
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error })
    }

    const usuarioIdLogado = (req as RequestWithAuth).user?.userId;
    if (!usuarioIdLogado) {
        return res.status(401).json({ erro: "Usuário não autenticado corretamente." });
    }

    const { gibiId, avaliacao } = valida.data

    try {
        const novaNota = await prisma.nota.create({
            data: { 
                gibiId, 
                avaliacao,
                usuarioId: Number(usuarioIdLogado)
             }
        })
        res.status(201).json(novaNota)
    } catch (error) {
        console.error("Erro ao criar nota:", error)
        res.status(500).json({ erro: "Erro ao criar nota" })
    }
})

router.put("/:id",authMiddleware, async (req, res) => {
    const { id } = req.params
    const valida = notaSchema.safeParse(req.body)
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error })
    }

    const usuarioIdLogado = (req as RequestWithAuth).user?.userId;
    if (!usuarioIdLogado) return res.status(401).json({ erro: "Usuário não autenticado." });


    const { gibiId, avaliacao } = valida.data

    try {
        const notaAtualizada = await prisma.nota.update({
            where: { id: Number(id) },
            data: { gibiId, avaliacao }
        })
        res.status(200).json(notaAtualizada)
    } catch (error) {
        console.error("Erro ao atualizar nota:", error)
        res.status(500).json({ erro: "Erro ao atualizar nota" })
    }
})

router.delete("/:id", authMiddleware, async (req: RequestWithAuth, res: Response) => {
    const { id } = req.params;
    const numericId = Number(id);
    if (isNaN(numericId)) return res.status(400).json({ erro: "ID da nota inválido."});

    const usuarioIdLogado = req.user?.userId;
    const roleUsuarioLogado = req.user?.role;

    if (!usuarioIdLogado) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    try {
        const notaExistente = await prisma.nota.findUnique({
            where: { id: numericId },
            select: { usuarioId: true } 
        });

        if (!notaExistente) {
            return res.status(404).json({ erro: "Nota não encontrada." });
        }

        const isOwner = notaExistente.usuarioId === usuarioIdLogado;
        const isAdmin = roleUsuarioLogado === Role.ADMIN; 

        if (!isOwner && !isAdmin) {
            console.log(`Permissão negada: User ${usuarioIdLogado} (Role: ${roleUsuarioLogado}) tentando excluir nota ${numericId} do user ${notaExistente.usuarioId}`);
            return res.status(403).json({ erro: "Permissão negada para excluir esta nota." });
        }
        console.log(`Permissão concedida: User ${usuarioIdLogado} (Role: ${roleUsuarioLogado}) excluindo nota ${numericId}`);
        await prisma.nota.delete({ where: { id: numericId } });
        res.status(204).send(); 

    } catch (error) {
        console.error(`Erro ao deletar nota ${id}:`, error);
        res.status(500).json({ erro: "Erro interno ao deletar nota" });
    }
});

export default router