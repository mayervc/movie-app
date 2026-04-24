import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clapperboard } from "lucide-react";
import { actorsService } from "@/services/actors.service";
import type { Actor } from "@/types/actor.types";

export const ActorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      actorsService
        .getActorById(id)
        .then(setActor)
        .catch(() => setActor(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-50">
            Actor no encontrado
          </h2>
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-8"
        >
          {/* Photo */}
          <div className="flex-shrink-0">
            {actor.profilePath ? (
              <img
                src={actor.profilePath}
                alt={actor.name}
                loading="lazy"
                className="w-48 h-72 object-cover rounded-2xl shadow-2xl shadow-black/40 mx-auto sm:mx-0"
              />
            ) : (
              <div className="w-48 h-72 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center mx-auto sm:mx-0">
                <span className="text-5xl font-bold text-slate-600">
                  {actor.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4">
              {actor.name}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6">
              {actor.knownForDepartment && (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Clapperboard size={15} className="text-blue-400" />
                  <span>{actor.knownForDepartment}</span>
                </div>
              )}
              {actor.birthdate && (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Calendar size={15} className="text-violet-400" />
                  <span>
                    {new Date(actor.birthdate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {actor.birthplace && (
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <MapPin size={15} className="text-blue-400" />
                  <span>{actor.birthplace}</span>
                </div>
              )}
            </div>

            {actor.biography && (
              <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Biografía
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {actor.biography}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
