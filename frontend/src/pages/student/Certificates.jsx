import { useQuery, useMutation } from '@tanstack/react-query'
import { Award, Download, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { certificatesAPI } from '../../api/endpoints'
import { formatDate, downloadBlob, getErrorMessage } from '../../utils/helpers'

export default function StudentCertificates() {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificatesAPI.list().then((r) => r.data.data),
  })

  const downloadMutation = useMutation({
    mutationFn: ({ id, title }) =>
      certificatesAPI.download(id).then((r) => ({ blob: r.data, title })),
    onSuccess: ({ blob, title }) => {
      downloadBlob(blob, `certificate-${title}.pdf`)
      toast.success('Certificate downloaded!')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (isLoading) return <Layout><LoadingSpinner className="mt-20" /></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-green-100 mt-1 text-lg">Download your earned certificates</p>
        </div>

        {certificates.length === 0 ? (
          <div className="card text-center py-16 border border-gray-800">
            <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No certificates yet</h3>
            <p className="text-gray-400 mt-2">
              Complete all sessions and assignments in a course to earn your certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="card hover:shadow-lg hover:shadow-green-500/10 transition-all border border-gray-800 hover:border-green-500/50">
                {/* Certificate visual */}
                <div className="h-36 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden border border-green-500/20">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 left-2 w-16 h-16 border-4 border-green-400 rounded-full" />
                    <div className="absolute bottom-2 right-2 w-12 h-12 border-4 border-green-400 rounded-full" />
                  </div>
                  <Award className="w-16 h-16 text-green-400 relative z-10" />
                </div>

                <h3 className="font-bold text-white text-lg">{cert.course_detail?.title}</h3>
                <p className="text-sm text-gray-400 mt-1">Certificate of Completion</p>

                <div className="flex items-center gap-1 text-xs text-green-400 mt-2 font-medium">
                  <Calendar className="w-3 h-3" />
                  Issued: {formatDate(cert.issued_at)}
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                  ID: {cert.certificate_id}
                </p>

                <button
                  onClick={() => downloadMutation.mutate({ id: cert.id, title: cert.course_detail?.title || 'certificate' })}
                  disabled={downloadMutation.isPending}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {downloadMutation.isPending ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
