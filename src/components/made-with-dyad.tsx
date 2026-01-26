import { useI18n } from "@/lib/i18n";

export const MadeWithDyad = () => {
  const { t } = useI18n();
  return (
    <div className="p-4 text-center">
      <a
        href="https://www.dyad.sh/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {t('madeWith')} Dyad
      </a>
    </div>
  );
};
