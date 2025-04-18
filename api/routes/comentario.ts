import { PrismaClient, Role } from '@prisma/client'; 
import { Router, Response } from 'express';      
import { z } from 'zod';
import authMiddleware, { RequestWithAuth } from '../middleware/authMiddleware'; 

const prisma = new PrismaClient();
const router = Router();
const comentarioBodySchema = z.object({
  conteudo: z.string().min(3, { message: "Comentário deve ter no mínimo 3 caracteres" }),
  gibiId: z.number(), 
});

const updateComentarioSchema = z.object({
    conteudo: z.string().min(3, { message: "Comentário deve ter no mínimo 3 caracteres" }),
});

router.get("/:gibiId", async (req, res: Response) => { 
    const { gibiId } = req.params;
    const numericGibiId = Number(gibiId);
    if (isNaN(numericGibiId)) {
        return res.status(400).json({ erro: "ID do gibi inválido." });
    }
    try {
        const comentarios = await prisma.comentario.findMany({
            where: { gibiId: numericGibiId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        notas: {
                            where: { gibiId: numericGibiId },
                            select: { avaliacao: true },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(comentarios);
    } catch (error) {
        console.error("Erro ao obter comentários com notas:", error);
        res.status(500).json({ erro: "Erro ao obter comentários" });
    }
});

router.post("/", authMiddleware, async (req: RequestWithAuth, res: Response) => { 
    const valida = comentarioBodySchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: "Dados inválidos", detalhes: valida.error.flatten().fieldErrors });
    }

    const usuarioIdLogado = req.user?.userId;
    if (!usuarioIdLogado) {
        return res.status(401).json({ erro: "Usuário não autenticado corretamente." });
    }

    const { conteudo, gibiId } = valida.data;

    try {
        const comentario = await prisma.comentario.create({
            data: {
                conteudo,
                gibiId,
                usuarioId: usuarioIdLogado 
            }
        });

        const comentarioCriado = await prisma.comentario.findUnique({
            where: { id: comentario.id },
            include: {
                usuario: {
                    select: {
                        id: true, nome: true,
                        notas: { where: { gibiId }, select: { avaliacao: true }, take: 1 }
                    }
                }
            }
        });
        res.status(201).json(comentarioCriado);
    } catch (error) {
        console.error("Erro ao criar comentário:", error);
        res.status(500).json({ erro: "Erro ao criar comentário" });
    }
});

router.put("/:id", authMiddleware, async (req: RequestWithAuth, res: Response) => {
    const { id } = req.params;
    const numericId = Number(id);
    if (isNaN(numericId)) return res.status(400).json({ erro: "ID do comentário inválido."});
    const valida = updateComentarioSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: "Dados inválidos", detalhes: valida.error.flatten().fieldErrors });
    }

    const usuarioIdLogado = req.user?.userId;
    const roleUsuarioLogado = req.user?.role;
    if (!usuarioIdLogado) return res.status(401).json({ erro: "Usuário não autenticado." });

    const { conteudo } = valida.data;

    try {
  
        const comentarioExistente = await prisma.comentario.findUnique({
            where: { id: numericId },
            select: { usuarioId: true } 
        });

        if (!comentarioExistente) return res.status(404).json({ erro: "Comentário não encontrado." });

        const isOwner = comentarioExistente.usuarioId === usuarioIdLogado;
        const isAdmin = roleUsuarioLogado === Role.ADMIN; 

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ erro: "Permissão negada para editar este comentário." });
        }
        const comentarioAtualizado = await prisma.comentario.update({
            where: { id: numericId },
            data: { conteudo }
        });
        res.status(200).json(comentarioAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar comentário:", error);
        res.status(500).json({ erro: "Erro ao atualizar comentário" });
    }
});


 router.delete("/:id", authMiddleware, async (req: RequestWithAuth, res: Response) => {
    const { id } = req.params;
    const numericId = Number(id);
    if (isNaN(numericId)) return res.status(400).json({ erro: "ID do comentário inválido."});

    const usuarioIdLogado = req.user?.userId;
    const roleUsuarioLogado = req.user?.role;
    if (!usuarioIdLogado) return res.status(401).json({ erro: "Usuário não autenticado." });

    try {
 
        const comentarioExistente = await prisma.comentario.findUnique({
            where: { id: numericId },
            select: { usuarioId: true }
        });

        if (!comentarioExistente) return res.status(404).json({ erro: "Comentário não encontrado." });

        const isOwner = comentarioExistente.usuarioId === usuarioIdLogado;
        const isAdmin = roleUsuarioLogado === Role.ADMIN;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ erro: "Permissão negada para excluir este comentário." });
        }
        await prisma.comentario.delete({ where: { id: numericId } });
        res.status(204).send(); 

    } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        res.status(500).json({ erro: "Erro ao deletar comentário" });
    }
});

export default router;