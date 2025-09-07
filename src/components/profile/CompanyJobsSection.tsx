import { Button } from "@/components/ui/button";
import { Plus, MapPin, Eye, Star as StarIcon, Image as ImageIcon } from "lucide-react";
import type { Job } from "@/lib/api";

interface CompanyJobsSectionProps {
  jobs: Job[];
  loading: boolean;
  onCreate: () => void;
}

export function CompanyJobsSection({ jobs, loading, onCreate }: CompanyJobsSectionProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Minhas Vagas</h3>
        <Button onClick={onCreate} className="bg-gradient-primary text-white border-0">
          <Plus className="h-4 w-4 mr-2" />
          Criar Vaga
        </Button>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando vagas...</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="grid grid-cols-[6rem,1fr] gap-3 items-stretch">
                <div className="w-full h-full min-h-[4rem] rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {job.image_url ? (
                    <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                    {job.is_promoted && (
                      <span className="text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-0.5 flex items-center gap-1">
                        <StarIcon className="h-3 w-3" /> Promovida
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
                    {job.location && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>)}
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views || 0}</span>
                    <span>{job.created_at ? new Date(job.created_at).toLocaleDateString('pt-PT') : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Ainda não tem vagas publicadas</p>
          <Button onClick={onCreate} className="bg-gradient-primary text-white border-0">
            Publicar Primeira Vaga
          </Button>
        </div>
      )}
    </div>
  );
}
