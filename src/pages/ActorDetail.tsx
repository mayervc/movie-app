import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clapperboard,
  Film,
  Star,
  User,
} from "lucide-react";
import { actorsService } from "@/services/actors.service";
import type { Actor } from "@/types/actor.types";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay },
  }),
};

export const ActorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const data = await actorsService.getActorById(id);
        setActor(data);
      } catch {
        setActor(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
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

  const initials = actor.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  const formattedBirthdate = actor.birthdate
    ? new Date(actor.birthdate).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.04)_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Volver al inicio</span>
        </Link>

        {/* Header — avatar + name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 15, delay: 0.1 }}
            className="flex-shrink-0"
          >
            {actor.profilePath ? (
              <img
                src={actor.profilePath}
                alt={actor.name}
                loading="lazy"
                className="w-36 h-52 sm:w-44 sm:h-64 object-cover rounded-2xl shadow-2xl shadow-black/50"
              />
            ) : (
              <div className="w-36 h-52 sm:w-44 sm:h-64 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <span className="text-5xl font-bold text-white select-none">
                  {initials}
                </span>
              </div>
            )}
          </motion.div>

          <div className="text-center sm:text-left pb-1">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">
              Actor
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4">
              {actor.name}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {actor.knownForDepartment && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/25 rounded-full text-blue-300 text-xs font-medium">
                  <Clapperboard size={12} />
                  {actor.knownForDepartment}
                </span>
              )}
              {formattedBirthdate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 border border-slate-600/40 rounded-full text-slate-300 text-xs">
                  <Calendar size={12} />
                  {formattedBirthdate}
                </span>
              )}
              {actor.birthplace && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 border border-slate-600/40 rounded-full text-slate-300 text-xs">
                  <MapPin size={12} />
                  {actor.birthplace}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Biography card */}
        {actor.biography && (
          <motion.div
            custom={0.15}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center">
                <User size={20} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-50">Biografía</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {actor.biography}
            </p>
          </motion.div>
        )}

        {/* Filmography card */}
        {actor.movies && actor.movies.length > 0 && (
          <motion.div
            custom={0.25}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-800/40 backdrop-blur-md border border-slate-700/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center">
                <Film size={20} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-50">Filmografía</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {actor.movies.length} {actor.movies.length === 1 ? "película" : "películas"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {actor.movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    to={`/movie/${movie.id}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-2 aspect-[2/3] bg-slate-700/50">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={32} className="text-slate-600" />
                        </div>
                      )}

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Rating badge */}
                      {movie.rating != null && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-[10px] font-semibold">
                            {movie.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-200 text-sm font-medium leading-snug group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
                      {movie.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-slate-500 text-xs">{movie.year}</p>
                      {movie.character && (
                        <p className="text-slate-500 text-xs italic truncate ml-2 max-w-[60%] text-right">
                          {movie.character}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
