'use client';

// Permite usar o provedor dentro de um componente de servidor.
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext as criarContextoTRPC } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { criarClienteConsultas } from '@/trpc/cliente-consultas';
import type { RoteadorAplicacao } from '@/trpc/roteadores/aplicacao';
import superjson from 'superjson';

export const { TRPCProvider: ProvedorTRPC, useTRPC: usarTRPC } = criarContextoTRPC<RoteadorAplicacao>();

let clienteConsultasNavegador: QueryClient;
function obterClienteConsultas() {
    if (typeof window === 'undefined') {
        // No servidor, cada renderização recebe seu próprio cliente.
        return criarClienteConsultas();
    }
    // No navegador, preserva o cliente entre renderizações e suspensões
    // para evitar perder o cache e repetir as consultas.
    if (!clienteConsultasNavegador) clienteConsultasNavegador = criarClienteConsultas();
    return clienteConsultasNavegador;
}

function obterUrl() {
    const base = (() => {
        if (typeof window !== 'undefined') return '';
        if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
        return 'http://localhost:3000';
    })();
    return `${base}/api/trpc`;
}

export function ProvedorTRPCReact(
    propriedades: Readonly<{
        children: React.ReactNode;
    }>,
) {
    /**
     * @see obterClienteConsultas
     */
    const clienteConsultas = obterClienteConsultas();

    const [clienteTRPC] = useState(() =>
        createTRPCClient<RoteadorAplicacao>({
            // Agrupa as operações tRPC em uma única requisição HTTP.
            links: [
                httpBatchLink({
                    transformer: superjson,
                    url: obterUrl(),
                }),
            ],
        }),
    );

    return (
        <QueryClientProvider client={clienteConsultas}>
            <ProvedorTRPC trpcClient={clienteTRPC} queryClient={clienteConsultas}>
                {propriedades.children}
            </ProvedorTRPC>
        </QueryClientProvider>
    );
}