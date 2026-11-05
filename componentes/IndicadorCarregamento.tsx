function IndicadorCarregamento() {
    return (
        <div className="flex justify-center py-10" role="status" aria-label="Carregando">
            <div className="size-6 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500" />
        </div>
    );
}

export default IndicadorCarregamento;
