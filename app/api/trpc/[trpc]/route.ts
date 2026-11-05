import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { criarContextoTRPC } from '@/trpc/inicializacao';
import { roteadorAplicacao } from '@/trpc/roteadores/aplicacao';

const tratarRequisicao = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: roteadorAplicacao,
        createContext: () => criarContextoTRPC({ headers: req.headers }),
    });

export { tratarRequisicao as GET, tratarRequisicao as POST };